/**
 * =====================================================
 * ملف خدمة PocketBase
 * =====================================================
 * 
 * هذا الملف يستبدل supabase.ts ويوفر نفس الواجهة بالضبط
 * حتى لا نحتاج لتغيير أي شيء في باقي التطبيق
 * 
 * التغيير الوحيد في App.tsx هو تغيير سطر الاستيراد:
 * من: import { supabaseService } from './services/supabase';
 * إلى: import { supabaseService } from './services/pocketbase';
 * 
 * =====================================================
 */

import PocketBase from 'pocketbase';
import { ClinicData } from '../types';
import { INITIAL_DATA } from '../initialData';

// =====================================================
// إعدادات الاتصال
// =====================================================

/** رابط سيرفر PocketBase */
const PB_URL = 'https://maindb-pocketbase.koovic.com';

/** إنشاء اتصال PocketBase */
export const pb = new PocketBase(PB_URL);

/** 
 * تعطيل الإلغاء التلقائي للطلبات
 * هذا مهم لمنع إلغاء الطلبات عند التنقل السريع في التطبيق
 */
pb.autoCancellation(false);


// =====================================================
// تعريف هيكل الأعمدة الأربعة
// =====================================================

/**
 * العمود الأول: الإعدادات الأساسية والكوادر الطبية
 * - هذا العمود صغير الحجم ويُقرأ دائماً عند بدء التطبيق
 * - يحتوي على إعدادات العيادة والأطباء والسكرتيرات
 */
interface Content1 {
  settings: ClinicData['settings'];      // إعدادات العيادة
  clinicName: string;                     // اسم العيادة
  doctors: ClinicData['doctors'];         // قائمة الأطباء
  secretaries: ClinicData['secretaries']; // قائمة السكرتيرات
  lastUpdated: number;                    // وقت آخر تحديث
}

/**
 * العمود الثاني: الأدوية والمختبر والمخزون
 * - بيانات مرجعية تُستخدم في الوصفات وطلبات المختبر
 * - متوسط الحجم ولا تتغير كثيراً
 */
interface Content2 {
  medications: ClinicData['medications'];                   // قائمة الأدوية
  medicationCategories: ClinicData['medicationCategories']; // تصنيفات الأدوية
  labOrders: ClinicData['labOrders'];                       // طلبات المختبر
  inventory: ClinicData['inventory'];                       // المخزون
}

/**
 * العمود الثالث: المرضى ومواعيدهم
 * - هذا العمود الأكبر حجماً
 * - يحتوي على كل بيانات المرضى والمواعيد والمدفوعات
 */
interface Content3 {
  patients: ClinicData['patients'];               // قائمة المرضى مع كل بياناتهم
  guestAppointments: ClinicData['guestAppointments']; // مواعيد الزوار
}

/**
 * العمود الرابع: المذكرات والمالية
 * - المذكرات الشخصية للطبيب
 * - المشتريات والمصروفات
 * - قائمة العناصر المحذوفة لمنع تكرارها
 */
interface Content4 {
  memos: ClinicData['memos'];           // المذكرات
  supplies: ClinicData['supplies'];     // المشتريات
  expenses: ClinicData['expenses'];     // المصروفات
  deletedIds: ClinicData['deletedIds']; // العناصر المحذوفة
}


// =====================================================
// دوال المساعدة
// =====================================================

/**
 * تحليل محتوى JSON من قاعدة البيانات
 * 
 * هذه الدالة تتعامل مع البيانات سواء كانت:
 * - نص JSON يحتاج تحليل
 * - كائن JavaScript جاهز
 * - قيمة فارغة أو غير موجودة
 * 
 * @param content - المحتوى من قاعدة البيانات
 * @param defaultValue - القيمة الافتراضية إذا فشل التحليل
 * @returns البيانات المحللة أو القيمة الافتراضية
 */
const parseJsonContent = <T>(content: any, defaultValue: T): T => {
  // إذا كان المحتوى فارغاً، أرجع القيمة الافتراضية
  if (!content) return defaultValue;
  
  // إذا كان نصاً، حاول تحليله كـ JSON
  if (typeof content === 'string') {
    try {
      return JSON.parse(content) as T;
    } catch (e) {
      console.error("فشل تحليل JSON:", e);
      return defaultValue;
    }
  }
  
  // إذا كان كائناً جاهزاً، أرجعه مباشرة
  return content as T;
};


/**
 * توزيع البيانات على الأعمدة الأربعة
 * 
 * هذه الدالة تأخذ كل البيانات وتوزعها على 4 أعمدة
 * كما تقوم بتنظيف الصور الكبيرة (base64) قبل الحفظ
 * 
 * @param data - بيانات العيادة الكاملة
 * @returns البيانات موزعة على 4 كائنات
 */
const distributeDataToColumns = (data: ClinicData) => {
  
  // --------- تنظيف البيانات قبل الحفظ ---------
  
  // نسخة عميقة من البيانات لتجنب تعديل الأصل
  const cleanData = JSON.parse(JSON.stringify(data));
  
  // تنظيف الإعدادات من صور base64 الكبيرة
  // (هذه الصور تُحفظ محلياً فقط في localStorage)
  if (cleanData.settings) {
    // صورة خلفية الوصفة الطبية
    if (cleanData.settings.rxBackgroundImage?.startsWith('data:')) {
      cleanData.settings.rxBackgroundImage = "";
    }
    // صورة خلفية نموذج الموافقة
    if (cleanData.settings.consentBackgroundImage?.startsWith('data:')) {
      cleanData.settings.consentBackgroundImage = "";
    }
    // صورة خلفية التعليمات
    if (cleanData.settings.instructionsBackgroundImage?.startsWith('data:')) {
      cleanData.settings.instructionsBackgroundImage = "";
    }
  }
  
  // تنظيف صور خلفية الوصفة الخاصة بكل طبيب
  if (cleanData.doctors) {
    cleanData.doctors = cleanData.doctors.map((doc: any) => ({
      ...doc,
      rxBackgroundImage: doc.rxBackgroundImage?.startsWith('data:') ? "" : doc.rxBackgroundImage
    }));
  }
  
  // تنظيف صور بروفايل المرضى الكبيرة
  // (نحتفظ فقط بروابط Google Drive)
  if (cleanData.patients) {
    cleanData.patients = cleanData.patients.map((patient: any) => ({
      ...patient,
      profilePicture: patient.profilePicture?.startsWith('data:') ? "" : patient.profilePicture
    }));
  }
  
  // --------- توزيع البيانات على الأعمدة ---------
  
  return {
    // العمود 1: الإعدادات والكوادر
    content1: {
      settings: cleanData.settings || INITIAL_DATA.settings,
      clinicName: cleanData.clinicName || '',
      doctors: cleanData.doctors || [],
      secretaries: cleanData.secretaries || [],
      lastUpdated: Date.now() // تحديث الوقت
    },
    
    // العمود 2: الأدوية والمختبر
    content2: {
      medications: cleanData.medications || [],
      medicationCategories: cleanData.medicationCategories || [],
      labOrders: cleanData.labOrders || [],
      inventory: cleanData.inventory || []
    },
    
    // العمود 3: المرضى
    content3: {
      patients: cleanData.patients || [],
      guestAppointments: cleanData.guestAppointments || []
    },
    
    // العمود 4: المذكرات والمالية
    content4: {
      memos: cleanData.memos || [],
      supplies: cleanData.supplies || [],
      expenses: cleanData.expenses || [],
      deletedIds: cleanData.deletedIds || []
    }
  };
};


/**
 * دمج البيانات من الأعمدة الأربعة إلى كائن واحد
 * 
 * هذه الدالة تعكس عملية التوزيع
 * تأخذ البيانات من 4 أعمدة وتجمعها في كائن ClinicData واحد
 * 
 * @param content1 - بيانات العمود الأول
 * @param content2 - بيانات العمود الثاني
 * @param content3 - بيانات العمود الثالث
 * @param content4 - بيانات العمود الرابع
 * @returns بيانات العيادة الكاملة
 */
const mergeColumnsToData = (
  content1: Content1,
  content2: Content2,
  content3: Content3,
  content4: Content4
): ClinicData => {
  return {
    // البدء بالقيم الافتراضية
    ...INITIAL_DATA,
    
    // --------- من العمود 1 ---------
    settings: content1.settings || INITIAL_DATA.settings,
    clinicName: content1.clinicName || '',
    doctors: content1.doctors || [],
    secretaries: content1.secretaries || [],
    lastUpdated: content1.lastUpdated || 0,
    
    // --------- من العمود 2 ---------
    medications: content2.medications || [],
    medicationCategories: content2.medicationCategories || [],
    labOrders: content2.labOrders || [],
    inventory: content2.inventory || [],
    
    // --------- من العمود 3 ---------
    patients: content3.patients || [],
    guestAppointments: content3.guestAppointments || [],
    
    // --------- من العمود 4 ---------
    memos: content4.memos || [],
    supplies: content4.supplies || [],
    expenses: content4.expenses || [],
    deletedIds: content4.deletedIds || []
  };
};


// =====================================================
// الخدمة الرئيسية
// =====================================================

/**
 * خدمة PocketBase
 * 
 * هذه الخدمة توفر نفس الواجهة التي كانت في supabaseService
 * حتى لا نحتاج لتغيير أي كود في باقي التطبيق
 */
export const pocketbaseService = {
  
  /**
   * تسجيل حساب جديد
   * 
   * ملاحظة: أنت ذكرت أنك تنشئ سجل user_data يدوياً
   * لذا هذه الدالة فقط تنشئ المستخدم وتسجل دخوله
   * 
   * @param email - البريد الإلكتروني
   * @param password - كلمة المرور
   * @returns نتيجة التسجيل
   */
  signUp: async (email: string, password: string) => {
    try {
      // إنشاء المستخدم
      const userData = {
        email: email,
        password: password,
        passwordConfirm: password,
        emailVisibility: true
      };
      
      await pb.collection('users').create(userData);
      
      // تسجيل الدخول تلقائياً بعد إنشاء الحساب
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return { 
        data: { user: authData.record }, 
        error: null 
      };
    } catch (error: any) {
      console.error('خطأ في التسجيل:', error);
      return { 
        data: null, 
        error: { message: error.message || 'فشل إنشاء الحساب' } 
      };
    }
  },

  
  /**
   * تسجيل الدخول
   * 
   * @param email - البريد الإلكتروني
   * @param password - كلمة المرور
   * @returns نتيجة تسجيل الدخول مع بيانات المستخدم
   */
  signIn: async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return { 
        data: { user: authData.record, session: authData }, 
        error: null 
      };
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      return { 
        data: null, 
        error: { message: error.message || 'فشل تسجيل الدخول' } 
      };
    }
  },

  
  /**
   * تسجيل الخروج
   * 
   * يمسح بيانات الجلسة من المتصفح
   */
  signOut: async () => {
    try {
      pb.authStore.clear();
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  
  /**
   * الحصول على المستخدم الحالي
   * 
   * يتحقق من وجود جلسة صالحة ويرجع بيانات المستخدم
   * 
   * @returns بيانات المستخدم أو null
   */
  getUser: async () => {
    try {
      // التحقق من صلاحية الجلسة ووجود بيانات المستخدم
      if (pb.authStore.isValid && pb.authStore.model) {
        return pb.authStore.model;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  
  /**
   * التحقق من حالة الحساب
   * 
   * يتحقق مما إذا كان المستخدم لديه سجل بيانات في قاعدة البيانات
   * 
   * @returns كائن يحتوي على exists (هل السجل موجود) و error (هل حدث خطأ)
   */
  checkAccountStatus: async (): Promise<{ exists: boolean; error: boolean }> => {
    try {
      const user = await pocketbaseService.getUser();
      if (!user) return { exists: false, error: false };

      // البحث عن سجل البيانات الخاص بالمستخدم
      const records = await pb.collection('user_data').getList(1, 1, {
        filter: `user_id = "${user.id}"`
      });

      return { exists: records.items.length > 0, error: false };
    } catch (e: any) {
      console.error('خطأ في التحقق من الحساب:', e.message);
      return { exists: true, error: true };
    }
  },

  
  /**
   * تحميل البيانات من قاعدة البيانات
   * 
   * هذه الدالة تتعامل مع حالتين:
   * 1. الشكل القديم: عمود content واحد يحتوي كل البيانات
   * 2. الشكل الجديد: 4 أعمدة (content1, content2, content3, content4)
   * 
   * @returns بيانات العيادة الكاملة أو null
   */
  loadData: async (): Promise<ClinicData | null> => {
    // التحقق من تسجيل الدخول
    const user = await pocketbaseService.getUser();
    if (!user) return null;

    try {
      // جلب آخر سجل للمستخدم
      const records = await pb.collection('user_data').getList(1, 1, {
        filter: `user_id = "${user.id}"`,
        sort: '-updated' // الأحدث أولاً
      });

      // إذا لم يوجد سجل، أرجع null
      if (records.items.length === 0) {
        return null;
      }

      const row = records.items[0];

      // --------- التحقق من شكل البيانات ---------
      
      // الشكل القديم: عمود content واحد
      if (row.content && !row.content1) {
        console.log('تم اكتشاف الشكل القديم للبيانات (عمود واحد)');
        
        const oldContent = parseJsonContent<ClinicData>(row.content, INITIAL_DATA);
        
        return {
          ...INITIAL_DATA,
          ...oldContent,
          lastUpdated: oldContent.lastUpdated || 0
        };
      }

      // --------- الشكل الجديد: 4 أعمدة ---------
      
      // تحليل كل عمود على حدة
      const content1 = parseJsonContent<Content1>(row.content1, {
        settings: INITIAL_DATA.settings,
        clinicName: '',
        doctors: [],
        secretaries: [],
        lastUpdated: 0
      });

      const content2 = parseJsonContent<Content2>(row.content2, {
        medications: [],
        medicationCategories: [],
        labOrders: [],
        inventory: []
      });

      const content3 = parseJsonContent<Content3>(row.content3, {
        patients: [],
        guestAppointments: []
      });

      const content4 = parseJsonContent<Content4>(row.content4, {
        memos: [],
        supplies: [],
        expenses: [],
        deletedIds: []
      });

      // دمج الأعمدة في كائن واحد
      const mergedData = mergeColumnsToData(content1, content2, content3, content4);

      return {
        ...INITIAL_DATA,
        ...mergedData,
        lastUpdated: content1.lastUpdated || 0
      };

    } catch (error: any) {
      console.error('خطأ في تحميل البيانات:', error.message);
      return null;
    }
  },

  
  /**
   * حفظ البيانات في قاعدة البيانات
   * 
   * هذه الدالة:
   * 1. تنظف البيانات من الصور الكبيرة
   * 2. توزع البيانات على 4 أعمدة
   * 3. تحدث السجل الموجود
   * 
   * ملاحظة: لا تنشئ سجل جديد لأنك تنشئه يدوياً
   * 
   * @param clinicData - بيانات العيادة للحفظ
   */
  saveData: async (clinicData: ClinicData) => {
    // التحقق من تسجيل الدخول
    const user = await pocketbaseService.getUser();
    if (!user) return;

    // توزيع البيانات على 4 أعمدة (مع التنظيف)
    const distribution = distributeDataToColumns(clinicData);

    try {
      // البحث عن السجل الموجود
      const records = await pb.collection('user_data').getList(1, 1, {
        filter: `user_id = "${user.id}"`
      });

      // التحقق من وجود السجل
      if (records.items.length === 0) {
        throw new Error('لم يتم العثور على سجل البيانات. تأكد من إنشاء السجل يدوياً.');
      }

      // تحديث السجل الموجود
      await pb.collection('user_data').update(records.items[0].id, {
        content1: distribution.content1,
        content2: distribution.content2,
        content3: distribution.content3,
        content4: distribution.content4
      });

    } catch (error: any) {
      console.error('خطأ في حفظ البيانات:', error.message);
      throw new Error(error.message || 'فشلت عملية المزامنة مع قاعدة البيانات');
    }
  }
};


// =====================================================
// التصدير للتوافق مع الكود القديم
// =====================================================

/**
 * تصدير الخدمة باسم supabaseService للتوافق
 * 
 * هذا يعني أن App.tsx يمكنه استخدام:
 * import { supabaseService } from './services/pocketbase';
 * 
 * بدون تغيير أي كود آخر
 */
export const supabaseService = pocketbaseService;
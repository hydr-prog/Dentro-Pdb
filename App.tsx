/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                              ملف App.tsx الرئيسي
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * هذا هو الملف الرئيسي للتطبيق ويحتوي على:
 * - جميع حالات التطبيق (States)
 * - دوال المزامنة مع السحابة
 * - دوال إدارة البيانات (إضافة، تعديل، حذف)
 * - منطق التنقل بين الصفحات
 * - إدارة النوافذ المنبثقة (Modals)
 * 
 * التغيير الوحيد عن الإصدار السابق:
 * - تم تغيير استيراد supabaseService من ملف pocketbase بدلاً من supabase
 * - هذا يعني أن التطبيق الآن يستخدم PocketBase كقاعدة بيانات
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
//                              استيراد المكتبات
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';

// استيراد أيقونات Lucide React
import { 
  Menu,           // أيقونة القائمة
  X,              // أيقونة الإغلاق
  Plus,           // أيقونة الإضافة
  Search,         // أيقونة البحث
  Trash2,         // أيقونة الحذف
  Pill,           // أيقونة الدواء
  WifiOff,        // أيقونة عدم الاتصال
  LayoutDashboard,// أيقونة لوحة التحكم
  RefreshCw,      // أيقونة التحديث
  AlertCircle,    // أيقونة التنبيه
  CloudCheck,     // أيقونة السحابة (متزامن)
  Cloud,          // أيقونة السحابة
  LayoutGrid,     // أيقونة الشبكة
  Folder,         // أيقونة المجلد
  ChevronLeft,    // سهم لليسار
  ArrowLeft,      // سهم للخلف
  CheckCircle2,   // أيقونة صح
  Smartphone      // أيقونة الهاتف
} from 'lucide-react';

// استيراد الأنواع (Types) المستخدمة في التطبيق
import { 
  ClinicData,           // بيانات العيادة الكاملة
  Doctor,               // بيانات الطبيب
  Secretary,            // بيانات السكرتير
  Patient,              // بيانات المريض
  Appointment,          // بيانات الموعد
  Payment,              // بيانات الدفعة
  Tooth,                // بيانات السن
  RootCanalEntry,       // بيانات علاج العصب
  Memo,                 // بيانات المذكرة
  Prescription,         // بيانات الوصفة الطبية
  Medication,           // بيانات الدواء
  SupplyItem,           // بيانات المشتريات
  ExpenseItem,          // بيانات المصروفات
  TodoItem,             // بيانات قائمة المهام
  ToothSurfaces,        // أسطح السن
  LabOrder,             // طلب المختبر
  InventoryItem,        // عنصر المخزون
  ToothNote,            // ملاحظة السن
  Language,             // اللغة
  MemoStyle,            // نمط المذكرة
  Examination,          // الفحص
  MedicalConditionItem, // الحالة الطبية
  PatientQueryAnswer,   // إجابة استفسار المريض
  MedicationCategory    // تصنيف الدواء
} from './types';

// استيراد البيانات الأولية
import { INITIAL_DATA } from './initialData';

// استيراد النصوص المترجمة
import { LABELS } from './locales';

// استيراد خدمة التخزين المحلي
import { storageService } from './services/storage';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *                          التغيير الرئيسي هنا
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * تم تغيير الاستيراد من:
 *   import { supabaseService } from './services/supabase';
 * 
 * إلى:
 *   import { supabaseService } from './services/pocketbase';
 * 
 * ملف pocketbase.ts يُصدّر supabaseService بنفس الاسم للتوافق
 * لذا لا نحتاج لتغيير أي شيء آخر في الكود
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import { supabaseService } from './services/pocketbase';

// استيراد خدمة Google Drive
import { googleDriveService } from './services/googleDrive';

// استيراد المكونات (Components)
import { ConfirmationModal } from './components/ConfirmationModal';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { ClinicSetup } from './components/ClinicSetup';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { PatientDetails } from './components/PatientDetails';
import { CalendarView } from './components/CalendarView';
import { MemosView } from './components/MemosView';
import { PurchasesView } from './components/PurchasesView';
import { InventoryView } from './components/InventoryView';
import { ExpensesView } from './components/ExpensesView';
import { SettingsView } from './components/SettingsView';
import { LabOrdersView } from './components/LabOrdersView';
import { PrintLayouts } from './components/PrintLayouts';

// استيراد النوافذ المنبثقة
import { 
  SupplyModal, 
  MemoModal, 
  PatientModal, 
  PaymentModal, 
  AppointmentModal, 
  AddMasterDrugModal, 
  ExpenseModal, 
  LabOrderModal, 
  InventoryModal, 
  PrescriptionModal 
} from './components/AppModals';

import { ProfileSelector } from './components/ProfileSelector';

// استيراد دوال التاريخ
import { isSameDay, isSameWeek, isSameMonth, addDays } from 'date-fns';

// استيراد الشعار
import { Logo } from './components/Logo';

// استيراد الثيمات
import { THEMES } from './constants';

// استيراد الدوال المساعدة
import { hexToRgb, granularMerge, normalizeDigits, generateId } from './utils';


// ═══════════════════════════════════════════════════════════════════════════════
//                              المكون الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات البيانات الرئيسية
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * بيانات العيادة الكاملة
   * تحتوي على: المرضى، الأطباء، المواعيد، الإعدادات، إلخ
   */
  const [data, setData] = useState<ClinicData>(INITIAL_DATA);
  
  /**
   * حالة التطبيق الحالية
   * - 'loading': جاري التحميل
   * - 'landing': صفحة الهبوط (الترحيب)
   * - 'auth': صفحة تسجيل الدخول
   * - 'profile_select': صفحة اختيار الملف الشخصي
   * - 'app': التطبيق الرئيسي
   */
  const [appState, setAppState] = useState<'landing' | 'auth' | 'profile_select' | 'app' | 'loading'>('loading');
  
  /**
   * هل التحميل الأولي جاري؟
   * يُستخدم لإظهار شاشة التحميل
   */
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات تسجيل الدخول
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** البريد الإلكتروني المُدخل */
  const [loginEmail, setLoginEmail] = useState('');
  
  /** كلمة المرور المُدخلة */
  const [loginPassword, setLoginPassword] = useState('');
  
  /** هل جاري تسجيل الدخول؟ */
  const [authLoading, setAuthLoading] = useState(false);
  
  /** رسالة خطأ تسجيل الدخول */
  const [authError, setAuthError] = useState('');
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات الملف الشخصي النشط
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * معرّف الطبيب النشط حالياً
   * إذا كان null فالمستخدم هو المسؤول (Admin)
   */
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);
  
  /**
   * معرّف السكرتير النشط حالياً
   * إذا كان موجوداً فالمستخدم هو سكرتير
   */
  const [activeSecretaryId, setActiveSecretaryId] = useState<string | null>(null);
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات المزامنة والاتصال
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * حالة المزامنة مع السحابة
   * - 'synced': متزامن
   * - 'syncing': جاري المزامنة
   * - 'error': خطأ في المزامنة
   * - 'offline': غير متصل
   */
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  
  /**
   * هل الجهاز غير متصل بالإنترنت؟
   */
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات التنقل والعرض
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * الصفحة الحالية المعروضة
   */
  const [currentView, setCurrentView] = useState<
    'patients' | 'dashboard' | 'memos' | 'calendar' | 
    'settings' | 'purchases' | 'expenses' | 'labOrders' | 'inventory'
  >('patients');
  
  /** تصنيف المرضى المختار */
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  /** نص البحث */
  const [searchQuery, setSearchQuery] = useState('');
  
  /** معرّف المريض المختار */
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  /** معرّف المريض للموعد الجديد */
  const [apptPatientId, setApptPatientId] = useState<string | null>(null);
  
  /** التبويب النشط في صفحة المريض */
  const [patientTab, setPatientTab] = useState<
    'overview' | 'chart' | 'visits' | 'finance' | 
    'prescriptions' | 'documents' | 'examination'
  >('overview');
  
  /** هل الشريط الجانبي مفتوح؟ (للشاشات الصغيرة) */
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  /** عرض التقويم (شهري، أسبوعي، يومي) */
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  
  /** التاريخ الحالي في التقويم */
  const [currentDate, setCurrentDate] = useState(new Date());
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات العمليات الجارية
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * هذه الحالات تُستخدم لمنع العمليات المتكررة
   * وإظهار مؤشر التحميل في الأزرار
   */
  
  /** هل جاري معالجة بيانات مريض؟ */
  const [isProcessingPatient, setIsProcessingPatient] = useState(false);
  
  /** هل جاري معالجة موعد؟ */
  const [isProcessingAppt, setIsProcessingAppt] = useState(false);
  
  /** هل جاري معالجة عملية مالية؟ */
  const [isProcessingFinance, setIsProcessingFinance] = useState(false);
  
  /** هل جاري معالجة فحص؟ */
  const [isProcessingExam, setIsProcessingExam] = useState(false);
  
  /** هل جاري معالجة وصفة طبية؟ */
  const [isProcessingRx, setIsProcessingRx] = useState(false);
  
  /** هل جاري عملية حذف؟ */
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  
  /** هل جاري رفع صورة البروفايل؟ */
  const [isProcessingProfilePic, setIsProcessingProfilePic] = useState(false);
  
  /** رسالة خطأ العملية الحالية */
  const [opError, setOpError] = useState<string | null>(null);

  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات النوافذ المنبثقة
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** نافذة إضافة مريض جديد */
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  
  /** نافذة تعديل المريض */
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  
  /** نافذة الدفع */
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  /** نوع الدفع (دفعة أو رسوم) */
  const [paymentType, setPaymentType] = useState<'payment' | 'charge'>('payment'); 
  
  /** الدفعة المختارة للتعديل */
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  /** نافذة الموعد */
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  /** الموعد المختار للتعديل */
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null); 
  
  /** وضع الموعد (لمريض موجود أو جديد) */
  const [appointmentMode, setAppointmentMode] = useState<'existing' | 'new'>('existing');
  
  /** نافذة المذكرة */
  const [showMemoModal, setShowMemoModal] = useState(false);
  
  /** المذكرة المختارة للتعديل */
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  
  /** نوع المذكرة (نص أو قائمة مهام) */
  const [memoType, setMemoType] = useState<'text' | 'todo' | null>(null); 
  
  /** قائمة المهام المؤقتة */
  const [tempTodos, setTempTodos] = useState<TodoItem[]>([]);
  
  /** نافذة طلب المختبر */
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  
  /** طلب المختبر المختار */
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null);
  
  /** نافذة المخزون */
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  /** عنصر المخزون المختار */
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  
  /** نافذة الوصفة الطبية */
  const [showRxModal, setShowRxModal] = useState(false);
  
  /** نافذة إضافة دواء جديد للقائمة الرئيسية */
  const [showAddMasterDrugModal, setShowAddMasterDrugModal] = useState(false);
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات الطباعة
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** الوصفة الطبية للطباعة */
  const [printingRx, setPrintingRx] = useState<Prescription | null>(null);
  
  /** الإيصال للطباعة */
  const [printingPayment, setPrintingPayment] = useState<Payment | null>(null);
  
  /** بطاقة الموعد للطباعة */
  const [printingAppointment, setPrintingAppointment] = useState<Appointment | null>(null);
  
  /** الفحص للطباعة */
  const [printingExamination, setPrintingExamination] = useState<Examination | null>(null);
  
  /** المستند للطباعة (موافقة أو تعليمات) */
  const [printingDocument, setPrintingDocument] = useState<{ 
    type: 'consent' | 'instructions', 
    text: string, 
    align: 'left'|'center'|'right', 
    fontSize: number, 
    topMargin: number 
  } | null>(null);
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالات أخرى
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** نافذة المشتريات */
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  
  /** المشتراة المختارة */
  const [selectedSupply, setSelectedSupply] = useState<SupplyItem | null>(null);
  
  /** نافذة المصروفات */
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  /** المصروف المختار */
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  
  /** موعد الزائر المراد تحويله لمريض */
  const [guestToConvert, setGuestToConvert] = useState<Appointment | null>(null);
  
  /** حدث تثبيت التطبيق المؤجل */
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  /** لغة صفحة الهبوط */
  const [landingLang, setLandingLang] = useState<'en'|'ar'|'ku'>('ar');
  
  
  // ═══════════════════════════════════════════════════════════════════════════
  //                    الإعدادات المحلية (localStorage)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * لغة الجهاز
   * تُحفظ محلياً ولا تُزامن مع السحابة
   * لأن كل جهاز قد يستخدم لغة مختلفة
   */
  const [deviceLang, setDeviceLang] = useState<Language>(() => 
    (localStorage.getItem('dentro_device_lang') as Language) || 'ar'
  );
  
  /**
   * حجم الواجهة
   * تُحفظ محلياً لأن كل شاشة لها حجم مناسب مختلف
   */
  const [deviceScale, setDeviceScale] = useState<number>(() => {
    const saved = localStorage.getItem('dentro_device_scale');
    return saved ? parseInt(saved) : 100;
  });
  
  /**
   * معرّف الثيم النشط
   * تُحفظ محلياً لأن كل مستخدم قد يفضل ثيم مختلف
   */
  const [activeThemeId, setActiveThemeId] = useState<string>(() => 
    localStorage.getItem('dentro_theme_id') || 'classic'
  );


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال المزامنة والاتصال
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * التحقق من الاتصال بالإنترنت
   * تُستخدم قبل العمليات التي تتطلب مزامنة سحابية
   * 
   * @throws Error إذا كان الجهاز غير متصل
   */
  const checkOnlineStatus = () => {
    if (!navigator.onLine) {
      throw new Error(
        deviceLang === 'ar' 
          ? 'يجب أن تكون متصلاً بالإنترنت لتنفيذ هذه العملية لضمان الحفظ السحابي.' 
          : 'You must be online to perform this operation to ensure cloud synchronization.'
      );
    }
  };

  /**
   * مزامنة البيانات مع السحابة
   * 
   * تقوم هذه الدالة بـ:
   * 1. التحقق من الاتصال بالإنترنت
   * 2. محاولة رفع البيانات للسحابة
   * 3. إعادة المحاولة عند الفشل (حتى 5 مرات)
   * 
   * @param newData - البيانات الجديدة للرفع
   * @param maxRetries - الحد الأقصى لمحاولات إعادة المحاولة
   * @returns true إذا نجحت المزامنة، false إذا فشلت
   */
  const syncToCloud = async (newData: ClinicData, maxRetries = 5): Promise<boolean> => {
    // التحقق من الاتصال وتسجيل الدخول
    if (!navigator.onLine || !newData.settings.isLoggedIn) {
      setSyncStatus('offline');
      return false;
    }
    
    setSyncStatus('syncing');
    let attempt = 0;
    
    // محاولة المزامنة مع إعادة المحاولة عند الفشل
    while (attempt < maxRetries) {
      try {
        await supabaseService.saveData(newData);
        setSyncStatus('synced');
        return true;
      } catch (err: any) {
        attempt++;
        if (attempt >= maxRetries) {
          setSyncStatus('error');
          return false;
        }
        // انتظار تصاعدي قبل إعادة المحاولة (2^n ثانية)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    return false;
  };

  /**
   * تحديث البيانات ومزامنتها
   * 
   * هذه الدالة هي الطريقة الرئيسية لتحديث البيانات في التطبيق
   * تقوم بـ:
   * 1. تحديث الحالة المحلية
   * 2. حفظ البيانات في التخزين المحلي
   * 3. مزامنة البيانات مع السحابة
   * 
   * @param updater - دالة تأخذ البيانات القديمة وترجع الجديدة
   */
  const updateAndSync = async (updater: (prev: ClinicData) => ClinicData) => {
    const ts = Date.now(); // الطابع الزمني الحالي
    
    setData(prev => {
      // تطبيق التحديث مع إضافة الطابع الزمني
      const next = { ...updater(prev), lastUpdated: ts };
      
      // حفظ محلي فوري
      storageService.saveData(next);
      
      // مزامنة سحابية في الخلفية
      syncToCloud(next); 
      
      return next;
    });
  };

  /**
   * تحديث الإعدادات
   * 
   * @param settings - الإعدادات الجديدة للدمج
   */
  const handleUpdateSettings = async (settings: Partial<ClinicData['settings']>) => {
    await updateAndSync(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  /**
   * المزامنة اليدوية
   * 
   * تُستخدم عندما يضغط المستخدم على زر المزامنة
   * تجلب البيانات من السحابة وتدمجها مع المحلية
   * 
   * @param force - إجبار الدمج حتى لو كانت البيانات المحلية أحدث
   * @returns true إذا نجحت المزامنة
   */
  const handleManualSync = async (force: boolean = false) => {
    // التحقق من إمكانية المزامنة
    if (!navigator.onLine || !data.settings.isLoggedIn) return;
    
    setSyncStatus('syncing');
    
    try {
      // جلب البيانات من السحابة
      const cloudData = await supabaseService.loadData();
      
      if (cloudData) {
        setData(prev => {
          // إذا كانت البيانات المحلية أحدث ولم يُطلب الإجبار، لا تدمج
          if (cloudData.lastUpdated <= prev.lastUpdated && !force) {
            setSyncStatus('synced');
            return prev;
          }
          
          // دمج البيانات (المحلية + السحابية)
          const merged = granularMerge(prev, cloudData);
          
          // تطبيق الإعدادات المحلية على البيانات المدمجة
          const final = mergeDataWithLocalPrefs(merged);
          
          // حفظ محلي
          storageService.saveData(final);
          
          setSyncStatus('synced');
          return final;
        });
        return true;
      }
    } catch (e: any) {
      setSyncStatus('error');
    }
    return false;
  };

  /**
   * ربط Google Drive
   * 
   * يُستخدم لمزامنة الملفات الكبيرة (صور البروفايل)
   */
  const handleLinkDrive = async () => {
    try {
      const token = await googleDriveService.login('consent');
      if (token) {
        await updateAndSync(prev => ({
          ...prev,
          settings: { ...prev.settings, googleDriveLinked: true }
        }));
      }
    } catch (e) {
      alert(deviceLang === 'ar' 
        ? "فشل ربط حساب Google Drive" 
        : "Failed to link Google Drive account"
      );
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال إدارة صور البروفايل
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * رفع صورة بروفايل للمريض
   * 
   * الصورة تُحفظ محلياً كـ base64
   * ولا تُرفع للسحابة مباشرة (لأنها كبيرة جداً)
   * يجب مزامنتها عبر Google Drive من الإعدادات
   * 
   * @param patientId - معرّف المريض
   * @param file - ملف الصورة
   */
  const handleProfilePicUploadAsync = async (patientId: string, file: File) => {
    setIsProcessingProfilePic(true);
    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // حفظ محلي فقط (الصورة كبيرة جداً للسحابة)
        await updatePatient(patientId, {
          profilePicture: base64String,
          profilePictureDriveId: undefined, // نلغي الـ ID لنعرف أنها غير مزامنة
          updatedAt: Date.now()
        });
        
        // إظهار التنبيه للمستخدم
        alert(deviceLang === 'ar' 
          ? "تم حفظ صورة البروفايل محلياً. يرجى الذهاب للإعدادات ومزامنة الملفات لرفعها على حساب Google Drive ومشاركتها مع باقي الأجهزة." 
          : "Profile picture saved locally. Please go to Settings and sync files to upload it to Google Drive and share with other devices."
        );
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message || "Failed to save profile picture");
    } finally {
      setIsProcessingProfilePic(false);
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال الحذف
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * جميع دوال الحذف تتبع نفس النمط:
   * 1. تفعيل مؤشر التحميل
   * 2. التحقق من الاتصال بالإنترنت
   * 3. تحديث البيانات المحلية
   * 4. مزامنة مع السحابة
   * 5. إيقاف مؤشر التحميل
   * 
   * نضيف العنصر المحذوف لقائمة deletedIds
   * حتى لا يظهر مجدداً عند المزامنة
   */

  /**
   * حذف مريض
   */
  const handleDeletePatientAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        patients: data.patients.filter(x => x.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      if (success) setSelectedPatientId(null);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف موعد
   */
  const handleDeleteAppointmentAsync = async (patientId: string, appId: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => 
          p.id === patientId 
            ? { ...p, appointments: p.appointments.filter(a => a.id !== appId), updatedAt: ts } 
            : p
        ),
        guestAppointments: (data.guestAppointments || []).filter(a => a.id !== appId),
        deletedIds: [...(data.deletedIds || []), appId]
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف دفعة مالية
   */
  const handleDeletePaymentAsync = async (patientId: string, paymentId: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => 
          p.id === patientId 
            ? { ...p, payments: p.payments.filter(pay => pay.id !== paymentId), updatedAt: ts } 
            : p
        ),
        deletedIds: [...(data.deletedIds || []), paymentId]
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف فحص
   */
  const handleDeleteExaminationAsync = async (patientId: string, examId: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => 
          p.id === patientId 
            ? { ...p, examinations: (p.examinations || []).filter(e => e.id !== examId), updatedAt: ts } 
            : p
        ),
        deletedIds: [...(data.deletedIds || []), examId]
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف وصفة طبية
   */
  const handleDeleteRxAsync = async (patientId: string, rxId: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => 
          p.id === patientId 
            ? { ...p, prescriptions: p.prescriptions.filter(r => r.id !== rxId), updatedAt: ts } 
            : p
        ),
        deletedIds: [...(data.deletedIds || []), rxId]
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف علاج عصب
   */
  const handleDeleteRCTAsync = async (patientId: string, rctId: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => 
          p.id === patientId 
            ? { ...p, rootCanals: p.rootCanals.filter(r => r.id !== rctId), updatedAt: ts } 
            : p
        ),
        deletedIds: [...(data.deletedIds || []), rctId]
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف مذكرة
   */
  const handleDeleteMemoAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        memos: data.memos.filter(x => x.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف مشتراة
   */
  const handleDeleteSupplyAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        supplies: (data.supplies || []).filter(x => x.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف عنصر مخزون
   */
  const handleDeleteInventoryItemAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        inventory: (data.inventory || []).filter(x => x.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف مصروف
   */
  const handleDeleteExpenseAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        expenses: (data.expenses || []).filter(x => x.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف طلب مختبر
   */
  const handleDeleteLabOrderAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        labOrders: (data.labOrders || []).filter(x => x.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف سكرتير
   */
  const handleDeleteSecretaryAsync = async (id: string) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        secretaries: (data.secretaries || []).filter(s => s.id !== id), 
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };

  /**
   * حذف طبيب
   * 
   * @param id - معرّف الطبيب
   * @param deletePatients - هل نحذف مرضى هذا الطبيب أيضاً؟
   */
  const handleDeleteDoctorAsync = async (id: string, deletePatients: boolean) => {
    setIsProcessingDelete(true);
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        doctors: data.doctors.filter(d => d.id !== id), 
        patients: deletePatients 
          ? data.patients.filter(p => p.doctorId !== id) 
          : data.patients,
        deletedIds: [...(data.deletedIds || []), id] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Delete failed'); 
    } finally { 
      setIsProcessingDelete(false); 
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          تأثيرات (Effects)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * الاستماع لحدث تثبيت التطبيق (PWA)
   * 
   * يُخزن الحدث ليُستخدم لاحقاً عند الضغط على زر التثبيت
   */
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  /**
   * تثبيت التطبيق كـ PWA
   */
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isRTL = deviceLang === 'ar' || deviceLang === 'ku';
      alert(isRTL 
        ? 'التطبيق مثبت بالفعل أو أن متصفحك لا يدعم التثبيت التلقائي حالياً. يمكنك تثبيته يدوياً من قائمة إعدادات المتصفح عن طريق اختيار "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).' 
        : 'App is already installed or your browser doesn\'t support auto-install right now. You can install it manually from your browser menu by selecting "Add to Home Screen".'
      );
    }
  };

  /**
   * معالجة زر الرجوع في المتصفح
   * 
   * هذا يسمح للمستخدم بإغلاق النوافذ المنبثقة
   * أو العودة للصفحة السابقة بالضغط على زر الرجوع
   */
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // عدم المعالجة إذا كانت هناك عملية جارية
      if (isProcessingPatient || isProcessingDelete || isProcessingAppt || 
          isProcessingFinance || isProcessingExam || isProcessingRx) return; 
      
      // إغلاق النوافذ المنبثقة بالترتيب
      if (showNewPatientModal) setShowNewPatientModal(false);
      else if (showEditPatientModal) setShowEditPatientModal(false);
      else if (showPaymentModal) setShowPaymentModal(false);
      else if (showAppointmentModal) setShowAppointmentModal(false);
      else if (showMemoModal) setShowMemoModal(false);
      else if (showLabOrderModal) setShowLabOrderModal(false);
      else if (showInventoryModal) setShowInventoryModal(false);
      else if (showRxModal) setShowRxModal(false);
      else if (showAddMasterDrugModal) setShowAddMasterDrugModal(false);
      else if (showSupplyModal) setShowSupplyModal(false);
      else if (showExpenseModal) setShowExpenseModal(false);
      else if (isSidebarOpen) setSidebarOpen(false);
      else if (selectedPatientId) setSelectedPatientId(null);
      else if (currentView !== 'patients' && appState === 'app') setCurrentView('patients');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    showNewPatientModal, showEditPatientModal, showPaymentModal, showAppointmentModal, 
    showMemoModal, showLabOrderModal, showInventoryModal, showRxModal, 
    showAddMasterDrugModal, showSupplyModal, showExpenseModal, isSidebarOpen, 
    selectedPatientId, currentView, appState, 
    isProcessingPatient, isProcessingDelete, isProcessingAppt, 
    isProcessingFinance, isProcessingExam, isProcessingRx
  ]);


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال التنقل
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * إضافة حالة للسجل التاريخي للتنقل
   * 
   * هذا يسمح بالعودة للخلف بالضغط على زر الرجوع
   */
  const pushNavState = () => {
    window.history.pushState({ navigated: true }, "");
  };

  /**
   * فتح صفحة مريض
   */
  const handleOpenPatient = (id: string) => {
    pushNavState();
    setSelectedPatientId(id);
  };

  /**
   * فتح نافذة منبثقة
   */
  const handleOpenModal = (setter: (val: boolean) => void) => {
    pushNavState();
    setter(true);
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                    دوال صورة خلفية الوصفة الطبية
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * رفع صورة خلفية الوصفة الطبية
   * 
   * ملاحظة: هذه الصورة تُحفظ في الإعدادات وتُزامن مع السحابة
   * لكن PocketBase سيحذف الصور الكبيرة (base64) تلقائياً
   * لذا يُفضل استخدام روابط خارجية
   */
  const handleRxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateAndSync(prev => ({
          ...prev,
          settings: { ...prev.settings, rxBackgroundImage: base64String }
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  /**
   * إزالة صورة خلفية الوصفة الطبية
   */
  const handleRemoveRxBg = async () => {
    await updateAndSync(prev => ({
      ...prev,
      settings: { ...prev.settings, rxBackgroundImage: '' }
    }));
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دمج الإعدادات المحلية
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * دمج البيانات الخارجية مع الإعدادات المحلية
   * 
   * عند جلب البيانات من السحابة، نحتاج لتطبيق الإعدادات المحلية
   * (اللغة، الثيم) لأنها خاصة بكل جهاز
   * 
   * @param externalData - البيانات القادمة من السحابة
   * @returns البيانات مع الإعدادات المحلية
   */
  const mergeDataWithLocalPrefs = (externalData: ClinicData): ClinicData => {
    // الحصول على نوع الثيم الحالي (فاتح أو داكن)
    const currentThemeMode = THEMES.find(t => t.id === activeThemeId)?.type || 'light';
    
    return {
      ...externalData,
      settings: {
        ...externalData.settings,
        language: deviceLang,          // اللغة المحلية
        theme: currentThemeMode        // الثيم المحلي
      }
    };
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          تهيئة التطبيق
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * تهيئة التطبيق عند التحميل
   * 
   * تقوم هذه الدالة بـ:
   * 1. تحميل البيانات المحلية
   * 2. تهيئة Google Drive
   * 3. التحقق من المستخدم المسجل
   * 4. جلب البيانات من السحابة
   * 5. تحديد الحالة الأولية للتطبيق
   */
  useEffect(() => {
    const initApp = async () => {
      // تحميل البيانات المحلية
      const localData = storageService.loadData();
      if (localData && localData.clinicName) {
        setData(mergeDataWithLocalPrefs(localData));
      }

      // تهيئة Google Drive
      googleDriveService.init(() => {
        console.log("Google Drive Service Initialized");
      });

      // التحقق من المستخدم المسجل
      const user = await supabaseService.getUser();
      if (!user) { 
        setAppState('landing'); 
        setIsInitialLoading(false); 
        return; 
      }

      // محاولة جلب البيانات من السحابة
      try {
        const cloudData = await supabaseService.loadData();
        if (cloudData) {
          setData(prev => {
            // دمج البيانات المحلية والسحابية
            const merged = granularMerge(prev, cloudData);
            const final = mergeDataWithLocalPrefs(merged);
            storageService.saveData(final);
            return final;
          });
        }
      } catch (e: any) { 
        console.warn("Initial sync failed, using local."); 
      }
      
      // تحديد الحالة الأولية للتطبيق
      const currentData = storageService.loadData();
      if (currentData && currentData.clinicName) {
        // التحقق من الملف الشخصي المحفوظ
        const savedProfileType = localStorage.getItem('dentro_profile_type');
        
        if (savedProfileType) {
          if (savedProfileType === 'admin') {
            setAppState('app');
          } else if (savedProfileType === 'doctor') {
            const docId = localStorage.getItem('dentro_active_profile');
            if (docId) {
              setActiveDoctorId(docId);
              setAppState('app');
            } else {
              setAppState('profile_select');
            }
          } else if (savedProfileType === 'secretary') {
            const secId = localStorage.getItem('dentro_active_secretary');
            if (secId) {
              setActiveSecretaryId(secId);
              setAppState('app');
              setCurrentView('patients');
            } else {
              setAppState('profile_select');
            }
          } else {
            setAppState('profile_select');
          }
        } else {
          setAppState('profile_select');
        }
      } else {
        // لا توجد بيانات، اذهب لإعداد العيادة
        setAppState('app'); 
      }
      
      setIsInitialLoading(false);
    };
    
    initApp();
  }, []);


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال المصادقة
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * معالجة تسجيل الدخول
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setAuthLoading(true); 
    setAuthError('');
    
    try {
      // محاولة تسجيل الدخول
      const result = await supabaseService.signIn(loginEmail, loginPassword);
      
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        // جلب البيانات من السحابة
        let cloudData = await supabaseService.loadData();
        
        // إذا كان الحساب جديداً (لا توجد بيانات)
        // ملاحظة: أنت ذكرت أنك تنشئ السجل يدوياً
        // لذا هذا الجزء قد لا يُنفذ أبداً
        if (!cloudData) {
          const initial = { 
            ...INITIAL_DATA, 
            settings: { ...INITIAL_DATA.settings, isLoggedIn: true } 
          };
          await supabaseService.saveData(initial);
          cloudData = initial;
        }

        if (cloudData) {
          // دمج مع الإعدادات المحلية
          const newData = mergeDataWithLocalPrefs(cloudData); 
          newData.settings.isLoggedIn = true;
          
          setData(newData); 
          storageService.saveData(newData); 
          setIsInitialLoading(false); 
          
          // الانتقال للصفحة المناسبة
          setAppState(cloudData.clinicName ? 'profile_select' : 'app');
        }
      }
    } catch (err: any) { 
      setAuthError(err.message || 'Auth failed'); 
    } finally { 
      setAuthLoading(false); 
    }
  };

  /**
   * معالجة إدخال اسم العيادة
   */
  const handleClinicNameSubmit = async (name: string) => { 
    await updateAndSync(prev => ({ ...prev, clinicName: name })); 
    setAppState('profile_select'); 
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال إدارة المرضى
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * إضافة مريض جديد
   * 
   * @param pData - بيانات المريض الجديد
   * @returns المريض المُضاف أو undefined
   */
  const handleAddPatientAsync = async (pData: any) => {
    setIsProcessingPatient(true); 
    setOpError(null);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      // إنشاء كائن المريض الجديد
      const newP = { 
        ...pData, 
        status: 'active', 
        id: generateId(), 
        createdAt: new Date().toISOString(), 
        updatedAt: ts, 
        teeth: {}, 
        appointments: [], 
        payments: [], 
        examinations: [], 
        notes: '', 
        rootCanals: [], 
        treatmentSessions: [], 
        prescriptions: [], 
        structuredMedicalHistory: [], 
        patientQueries: [] 
      };
      
      // تحديث البيانات
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        patients: [newP, ...data.patients] 
      };
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      if (success) {
        setShowNewPatientModal(false);
        return newP;
      }
      
    } catch (err: any) { 
      setOpError(err.message || 'Sync failed'); 
    } finally { 
      setIsProcessingPatient(false); 
    }
  };

  /**
   * تحديث بيانات مريض (مع انتظار المزامنة)
   * 
   * تُستخدم في نوافذ التعديل التي تنتظر نجاح المزامنة قبل الإغلاق
   */
  const updatePatientAsync = async (id: string, updates: Partial<Patient>) => {
    setIsProcessingPatient(true); 
    setOpError(null);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        patients: data.patients.map(p => 
          p.id === id ? { ...p, ...updates, updatedAt: ts } : p
        ) 
      };
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      if (success) setShowEditPatientModal(false);
      
    } catch (err: any) { 
      setOpError(err.message || 'Sync failed'); 
    } finally { 
      setIsProcessingPatient(false); 
    }
  };

  /**
   * تحديث بيانات مريض (بدون انتظار)
   * 
   * تُستخدم في التحديثات السريعة التي لا تتطلب انتظار
   */
  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    await updateAndSync(prev => ({
      ...prev,
      patients: prev.patients.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      )
    }));
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال الحفظ مع انتظار المزامنة
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * حفظ وصفة طبية
   */
  const handleSaveRxAsync = async (patientId: string, updates: Partial<Patient>) => {
    setIsProcessingRx(true); 
    setOpError(null);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = { 
        ...data, 
        lastUpdated: ts, 
        patients: data.patients.map(p => 
          p.id === patientId ? { ...p, ...updates, updatedAt: ts } : p
        ) 
      };
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      if (success) setShowRxModal(false);
      
    } catch (err: any) { 
      setOpError(err.message || 'Sync failed'); 
    } finally { 
      setIsProcessingRx(false); 
    }
  };

  /**
   * حفظ فحص
   */
  const handleSaveExaminationAsync = async (
    patientId: string, 
    examData: Examination, 
    isEdit: boolean
  ) => {
    setIsProcessingExam(true); 
    setOpError(null);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => {
          if (p.id !== patientId) return p;
          
          const exams = p.examinations || [];
          const updatedExams = isEdit 
            ? exams.map(e => e.id === examData.id ? { ...examData, updatedAt: ts } : e)
            : [{ ...examData, updatedAt: ts }, ...exams];
            
          return { ...p, examinations: updatedExams, updatedAt: ts };
        })
      };
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      return success;
      
    } catch (err: any) { 
      setOpError(err.message || 'Sync failed'); 
      return false; 
    } finally { 
      setIsProcessingExam(false); 
    }
  };

  /**
   * حفظ دفعة مالية
   */
  const handleSavePaymentAsync = async (
    patientId: string, 
    paymentData: any, 
    isEdit: boolean
  ) => {
    setIsProcessingFinance(true); 
    setOpError(null);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => {
          if (p.id !== patientId) return p;
          
          const payments = p.payments || [];
          const updatedPayments = isEdit 
            ? payments.map(pay => 
                pay.id === paymentData.id 
                  ? { ...pay, ...paymentData, updatedAt: ts } 
                  : pay
              )
            : [{ ...paymentData, id: generateId(), updatedAt: ts }, ...payments];
            
          return { ...p, payments: updatedPayments, updatedAt: ts };
        })
      };
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      if (success) setShowPaymentModal(false);
      
    } catch (err: any) { 
      setOpError(err.message || 'Sync failed'); 
    } finally { 
      setIsProcessingFinance(false); 
    }
  };

  /**
   * حفظ موعد
   */
  const handleSaveAppointmentAsync = async (
    patientId: string | null, 
    apptData: Partial<Appointment>
  ) => {
    setIsProcessingAppt(true); 
    setOpError(null);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      const id = selectedAppointment ? selectedAppointment.id : generateId();
      
      let newData;
      
      if (patientId) {
        // موعد لمريض موجود
        newData = {
          ...data,
          lastUpdated: ts,
          patients: data.patients.map(p => {
            if (p.id !== patientId) return p;
            
            const appts = selectedAppointment 
              ? p.appointments.map(a => 
                  a.id === id ? { ...a, ...apptData, updatedAt: ts } : a
                )
              : [...p.appointments, { 
                  ...apptData, 
                  id, 
                  patientId, 
                  patientName: p.name, 
                  status: 'scheduled', 
                  updatedAt: ts 
                } as Appointment];
                
            return { ...p, appointments: appts, updatedAt: ts };
          })
        };
      } else {
        // موعد لزائر (بدون ملف مريض)
        newData = {
          ...data,
          lastUpdated: ts,
          guestAppointments: selectedAppointment 
            ? (data.guestAppointments || []).map(a => 
                a.id === id ? { ...a, ...apptData, updatedAt: ts } : a
              )
            : [...(data.guestAppointments || []), { 
                ...apptData, 
                id, 
                patientId: '', 
                patientName: apptData.patientName || 'Guest', 
                status: 'scheduled', 
                updatedAt: ts 
              } as Appointment]
        };
      }
      
      setData(newData);
      storageService.saveData(newData);
      
      const success = await syncToCloud(newData);
      if (success) {
        setShowAppointmentModal(false); 
        setSelectedAppointment(null);
      }
      
    } catch (err: any) { 
      setOpError(err.message || 'Sync failed'); 
    } finally { 
      setIsProcessingAppt(false); 
    }
  };

  /**
   * تحديث حالة موعد
   */
  const handleUpdateAppointmentStatusAsync = async (
    patientId: string, 
    appId: string, 
    status: any
  ) => {
    setIsProcessingAppt(true);
    
    try {
      checkOnlineStatus();
      const ts = Date.now();
      
      const newData = {
        ...data,
        lastUpdated: ts,
        patients: data.patients.map(p => {
          if (p.id !== patientId) return p;
          
          return { 
            ...p, 
            appointments: p.appointments.map(a => 
              a.id === appId ? { ...a, status, updatedAt: ts } : a
            ), 
            updatedAt: ts 
          };
        })
      };
      
      setData(newData);
      storageService.saveData(newData);
      await syncToCloud(newData);
      
    } catch (err: any) { 
      alert(err.message || 'Update failed'); 
    } finally { 
      setIsProcessingAppt(false); 
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دوال تحديث الأسنان
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * تحديث حالة سن
   */
  const handleUpdateTooth = async (
    patientId: string, 
    toothId: number, 
    status: Tooth['status']
  ) => {
    await updateAndSync(prev => ({
      ...prev,
      patients: prev.patients.map(p => {
        if (p.id !== patientId) return p;
        
        const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
        
        return { 
          ...p, 
          updatedAt: Date.now(), 
          teeth: { 
            ...p.teeth, 
            [toothId]: { ...tooth, status, updatedAt: Date.now() } 
          } 
        };
      })
    }));
  };

  /**
   * تحديث سطح سن
   */
  const handleUpdateToothSurface = async (
    patientId: string, 
    toothId: number, 
    surface: keyof ToothSurfaces | 'all', 
    status: string
  ) => {
    await updateAndSync(prev => ({
      ...prev,
      patients: prev.patients.map(p => {
        if (p.id !== patientId) return p;
        
        const tooth = p.teeth[toothId] || { 
          id: toothId, 
          status: 'healthy', 
          surfaces: { top:'none', bottom:'none', left:'none', right:'none', center:'none' } 
        };
        
        let newSurfaces = { 
          ...(tooth.surfaces || { 
            top:'none', bottom:'none', left:'none', right:'none', center:'none' 
          }) 
        };
        
        if (surface === 'all') { 
          // تبديل كل الأسطح
          const val = newSurfaces.center === status ? 'none' : status; 
          newSurfaces = { top: val, bottom: val, left: val, right: val, center: val }; 
        } else { 
          // تبديل سطح واحد
          newSurfaces[surface] = newSurfaces[surface] === status ? 'none' : status; 
        }
        
        return { 
          ...p, 
          updatedAt: Date.now(), 
          teeth: { 
            ...p.teeth, 
            [toothId]: { ...tooth, surfaces: newSurfaces, updatedAt: Date.now() } 
          } 
        };
      })
    }));
  };

  /**
   * تحديث ملاحظة سن
   */
  const handleUpdateToothNote = async (
    patientId: string, 
    toothId: number, 
    note: ToothNote
  ) => {
    await updateAndSync(prev => ({
      ...prev,
      patients: prev.patients.map(p => {
        if (p.id !== patientId) return p;
        
        const tooth = p.teeth[toothId] || { id: toothId, status: 'healthy' };
        
        return { 
          ...p, 
          updatedAt: Date.now(), 
          teeth: { 
            ...p.teeth, 
            [toothId]: { 
              ...tooth, 
              specialNote: { ...note, updatedAt: Date.now() }, 
              updatedAt: Date.now() 
            } 
          } 
        };
      })
    }));
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          حفظ المذكرة (سريع)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * حفظ مذكرة
   * 
   * هذه الدالة مُحسنة للاستجابة السريعة:
   * 1. تحفظ محلياً فوراً
   * 2. تغلق النافذة فوراً
   * 3. تزامن في الخلفية
   */
  const handleSaveMemo = async (
    title: string, 
    content: string, 
    color: string, 
    type: 'text'|'todo' = 'text', 
    todos: TodoItem[], 
    style?: MemoStyle
  ) => {
    const ts = Date.now();
    
    const newData = {
      ...data,
      lastUpdated: ts,
      memos: selectedMemo 
        ? (data.memos || []).map(m => 
            m.id === selectedMemo.id 
              ? { ...m, title, content, color, type, todos, style, updatedAt: ts } 
              : m
          )
        : [{ 
            id: generateId(), 
            title, 
            content, 
            color, 
            type, 
            todos, 
            date: new Date().toISOString(), 
            style, 
            updatedAt: ts 
          }, ...(data.memos || [])]
    };
    
    // حفظ محلي فوري
    setData(newData);
    storageService.saveData(newData);
    
    // إغلاق النافذة فوراً للاستجابة السريعة
    setShowMemoModal(false); 
    setSelectedMemo(null);
    
    // مزامنة سحابية في الخلفية
    syncToCloud(newData);
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          تأثيرات الثيم والحجم
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * تطبيق الثيم عند تغييره
   */
  useEffect(() => {
    const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
    const root = document.documentElement;
    
    // تطبيق ألوان CSS
    root.style.setProperty('--primary-rgb', hexToRgb(theme.colors.primary));
    root.style.setProperty('--secondary-rgb', hexToRgb(theme.colors.secondary));
    root.style.setProperty('--bg-color', theme.colors.bg);
    
    // تطبيق الوضع الداكن/الفاتح
    if (theme.type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // حفظ محلياً
    localStorage.setItem('dentro_theme_id', activeThemeId);
  }, [activeThemeId]);

  /**
   * تطبيق حجم الواجهة عند تغييره
   */
  useEffect(() => {
    document.documentElement.style.fontSize = `${deviceScale}%`;
    localStorage.setItem('dentro_device_scale', deviceScale.toString());
  }, [deviceScale]);


  // ═══════════════════════════════════════════════════════════════════════════
  //                          حالة نافذة التأكيد
  // ═══════════════════════════════════════════════════════════════════════════

  const [confirmState, setConfirmState] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void; 
  }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {} 
  });
  
  /**
   * فتح نافذة تأكيد
   */
  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };
  
  /**
   * إغلاق نافذة التأكيد
   */
  const closeConfirm = () => { 
    if (!isProcessingDelete) {
      setConfirmState(prev => ({ ...prev, isOpen: false })); 
    }
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          البيانات المحسوبة
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * جميع المواعيد (مرضى + زوار)
   */
  const allAppointments = [
    // مواعيد المرضى
    ...data.patients.flatMap(p => 
      p.appointments.map(a => ({ ...a, patientName: p.name, patient: p }))
    ),
    // مواعيد الزوار
    ...(data.guestAppointments || []).map(a => ({ ...a, patient: null }))
  ];

  /**
   * البيانات المفلترة حسب الطبيب النشط
   */
  const filteredData = activeDoctorId 
    ? { ...data, patients: data.patients.filter(p => p.doctorId === activeDoctorId) } 
    : data;
  
  /**
   * المريض النشط حالياً
   */
  const activePatient = selectedPatientId 
    ? data.patients.find(p => p.id === selectedPatientId) 
    : null;
  
  /**
   * النصوص المترجمة للغة الحالية
   */
  const currentT = LABELS[deviceLang];
  
  /**
   * هل اللغة من اليمين لليسار؟
   */
  const isRTL = deviceLang === 'ar' || deviceLang === 'ku';


  // ═══════════════════════════════════════════════════════════════════════════
  //                          شاشة التحميل
  // ═══════════════════════════════════════════════════════════════════════════

  if (appState === 'loading' || isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 font-cairo">
        {/* الشعار */}
        <Logo className="w-24 h-24 mb-6" />
        
        {/* شريط التحميل */}
        <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary-500 w-0 animate-progress-fill"></div>
        </div>
        
        {/* نص التحميل */}
        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
          {deviceLang === 'ar' 
            ? 'جاري المزامنة، يرجى الانتظار قليلاً...' 
            : deviceLang === 'ku' 
              ? 'خەریکی هاوکاتکردنە، تکایە کەمێک چاوەڕوان بن...' 
              : 'Syncing, please wait a moment...'}
        </p>
      </div>
    );
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //                          دالة تسجيل الخروج
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * تسجيل الخروج من الملف الشخصي
   * (ليس من الحساب، فقط من الملف الشخصي)
   */
  const handleLogout = () => {
    setActiveDoctorId(null);
    setActiveSecretaryId(null);
    localStorage.removeItem('dentro_profile_type');
    localStorage.removeItem('dentro_active_profile');
    localStorage.removeItem('dentro_active_secretary');
    setAppState('profile_select');
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //                          الشاشات المختلفة
  // ═══════════════════════════════════════════════════════════════════════════

  // صفحة الهبوط (الترحيب)
  if (appState === 'landing') {
    return (
      <LandingPage 
        setAppState={setAppState} 
        landingLang={landingLang} 
        setLandingLang={setLandingLang} 
        isRTL={isRTL} 
      />
    );
  }
  
  // صفحة تسجيل الدخول
  if (appState === 'auth') {
    return (
      <AuthScreen 
        t={currentT} 
        loginEmail={loginEmail} 
        setLoginEmail={setLoginEmail} 
        loginPassword={loginPassword} 
        setLoginPassword={setLoginPassword} 
        authLoading={authLoading} 
        authError={authError} 
        handleAuth={handleAuth} 
        setAppState={setAppState} 
      />
    );
  }
  
  // صفحة اختيار الملف الشخصي
  if (appState === 'profile_select') {
    return (
      <ProfileSelector 
        t={currentT} 
        data={data} 
        loginPassword={loginPassword} 
        currentLang={deviceLang} 
        isRTL={isRTL} 
        onSelectAdmin={() => { 
          localStorage.setItem('dentro_profile_type', 'admin'); 
          setAppState('app'); 
        }} 
        onSelectDoctor={(id) => { 
          setActiveDoctorId(id); 
          localStorage.setItem('dentro_profile_type', 'doctor'); 
          localStorage.setItem('dentro_active_profile', id); 
          setAppState('app'); 
        }} 
        onSelectSecretary={(id) => { 
          setActiveSecretaryId(id); 
          localStorage.setItem('dentro_profile_type', 'secretary'); 
          localStorage.setItem('dentro_active_secretary', id); 
          setAppState('app'); 
          setCurrentView('patients'); 
        }} 
        onLogout={() => { 
          supabaseService.signOut(); 
          localStorage.clear(); 
          setAppState('landing'); 
        }} 
      />
    );
  }

  // صفحة إعداد العيادة (إذا لم يكن هناك اسم عيادة)
  if (appState === 'app' && !data.clinicName) {
    return (
      <ClinicSetup 
        t={currentT} 
        data={data} 
        setData={setData} 
        onboardingStep={1} 
        setOnboardingStep={() => {}} 
        handleClinicNameSubmit={handleClinicNameSubmit} 
        handleAddDoctor={() => {}} 
        handleDeleteDoctor={() => {}} 
        handleFinishSetup={() => {}} 
        isRTL={isRTL} 
        openConfirm={openConfirm} 
      />
    );
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //                          التطبيق الرئيسي
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div 
      className={`min-h-screen flex bg-page-bg font-${isRTL ? 'cairo' : 'sans'} leading-relaxed overflow-hidden`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*                        نافذة التأكيد                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <ConfirmationModal 
        isOpen={confirmState.isOpen} 
        title={confirmState.title} 
        message={confirmState.message} 
        onConfirm={async () => {
          await confirmState.onConfirm();
          closeConfirm();
        }} 
        onCancel={closeConfirm} 
        lang={deviceLang}
        isLoading={isProcessingDelete}
      />
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*                        الشريط الجانبي                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Sidebar 
        t={currentT} 
        data={data} 
        currentView={currentView} 
        setCurrentView={(view) => { 
          if(view !== currentView) pushNavState(); 
          setCurrentView(view); 
        }} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        setSelectedPatientId={setSelectedPatientId} 
        handleLogout={handleLogout} 
        isRTL={isRTL} 
        isSecretary={!!activeSecretaryId} 
        handleManualSync={handleManualSync} 
        syncStatus={syncStatus} 
      />
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*                        المحتوى الرئيسي                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        
        {/* شريط علوي للشاشات الصغيرة */}
        <div className="lg:hidden p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            <Menu />
          </button>
          <div className="font-bold dark:text-white flex items-center gap-2">
            {data.clinicName}
            {isOffline && <WifiOff size={14} className="text-red-500" />}
          </div>
        </div>
         
        {/* محتوى الصفحات */}
        <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto">
          
          {/* لوحة التحكم */}
          {currentView === 'dashboard' && !activeSecretaryId && (
            <DashboardView 
              t={currentT} 
              data={data} 
              allAppointments={allAppointments} 
              setData={setData} 
              activeDoctorId={activeDoctorId} 
              setSelectedPatientId={handleOpenPatient} 
              setCurrentView={setCurrentView} 
              setPatientTab={setPatientTab} 
            />
          )}
          
          {/* قائمة المرضى */}
          {currentView === 'patients' && !selectedPatientId && (
            <PatientsView 
              t={currentT} 
              data={filteredData} 
              isRTL={isRTL} 
              currentLang={deviceLang} 
              setSelectedPatientId={handleOpenPatient} 
              setPatientTab={setPatientTab} 
              setCurrentView={setCurrentView} 
              setShowNewPatientModal={(val) => handleOpenModal(() => { 
                setShowNewPatientModal(val); 
                setOpError(null); 
              })} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onAddAppointment={(pid) => { 
                setApptPatientId(pid); 
                handleOpenModal(() => setShowAppointmentModal(true)); 
              }} 
            />
          )}
          
          {/* تفاصيل المريض */}
          {currentView === 'patients' && selectedPatientId && activePatient && (
            <PatientDetails 
              t={currentT} 
              data={data} 
              setData={setData} 
              activePatient={activePatient} 
              patientTab={patientTab} 
              setPatientTab={setPatientTab} 
              setSelectedPatientId={setSelectedPatientId} 
              currentLang={deviceLang} 
              isRTL={isRTL} 
              updatePatient={updatePatient} 
              handleDeletePatient={handleDeletePatientAsync} 
              handleUpdateTooth={handleUpdateTooth} 
              handleUpdateToothSurface={handleUpdateToothSurface} 
              handleUpdateToothNote={handleUpdateToothNote} 
              handleUpdateHead={()=>{}} 
              handleUpdateBody={()=>{}} 
              handleAddRCT={(pid, rct) => updatePatient(pid, { 
                rootCanals: [...(activePatient.rootCanals || []), { 
                  ...rct, 
                  id: generateId(), 
                  updatedAt: Date.now() 
                }] 
              })} 
              handleDeleteRCT={handleDeleteRCTAsync} 
              handleUpdateAppointmentStatus={handleUpdateAppointmentStatusAsync} 
              handleDeleteRx={(rxid) => handleDeleteRxAsync(activePatient.id, rxid)} 
              setPrintingRx={setPrintingRx} 
              setPrintingPayment={setPrintingPayment} 
              setPrintingAppointment={setPrintingAppointment} 
              setPrintingExamination={setPrintingExamination} 
              handleRxFileUpload={handleRxFileUpload} 
              handleRemoveRxBg={handleRemoveRxBg} 
              setShowEditPatientModal={(val) => handleOpenModal(() => { 
                setShowEditPatientModal(val); 
                setOpError(null); 
              })} 
              setShowAppointmentModal={(val) => handleOpenModal(() => { 
                setShowAppointmentModal(val); 
                setOpError(null); 
              })} 
              setSelectedAppointment={setSelectedAppointment} 
              setAppointmentMode={setAppointmentMode} 
              setShowPaymentModal={(val) => handleOpenModal(() => { 
                setShowPaymentModal(val); 
                setOpError(null); 
              })} 
              setPaymentType={setPaymentType} 
              setSelectedPayment={setSelectedPayment}
              setShowRxModal={(val) => handleOpenModal(() => { 
                setShowRxModal(val); 
                setOpError(null); 
              })} 
              setShowAddMasterDrugModal={(val) => handleOpenModal(() => 
                setShowAddMasterDrugModal(val)
              )} 
              openConfirm={openConfirm} 
              setPrintingDocument={setPrintingDocument} 
              isSecretary={!!activeSecretaryId} 
              handleSaveExamination={handleSaveExaminationAsync} 
              handleDeleteExamination={handleDeleteExaminationAsync} 
              handleDeletePayment={handleDeletePaymentAsync}
              handleProfilePicUpload={handleProfilePicUploadAsync}
              isProcessingExam={isProcessingExam} 
              isProcessingFinance={isProcessingFinance} 
              isProcessingAppt={isProcessingAppt} 
              isProcessingProfilePic={isProcessingProfilePic}
              opError={opError} 
              setOpError={setOpError} 
            />
          )}
          
          {/* التقويم */}
          {currentView === 'calendar' && (
            <CalendarView 
              t={currentT} 
              data={data} 
              currentLang={deviceLang} 
              isRTL={isRTL} 
              calendarView={calendarView} 
              setCalendarView={setCalendarView} 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate} 
              filteredAppointments={allAppointments} 
              setSelectedAppointment={setSelectedAppointment} 
              setAppointmentMode={setAppointmentMode} 
              setShowAppointmentModal={(val) => handleOpenModal(() => 
                setShowAppointmentModal(val)
              )} 
              handleUpdateAppointmentStatus={handleUpdateAppointmentStatusAsync} 
              handleDeleteAppointment={handleDeleteAppointmentAsync} 
              setSelectedPatientId={handleOpenPatient} 
              setCurrentView={setCurrentView} 
              setPatientTab={setPatientTab} 
              setGuestToConvert={setGuestToConvert} 
              setShowNewPatientModal={(val) => handleOpenModal(() => 
                setShowNewPatientModal(val)
              )} 
              openConfirm={openConfirm} 
              setData={setData} 
              activeDoctorId={activeDoctorId} 
              isSecretary={!!activeSecretaryId} 
            />
          )}
          
          {/* المذكرات */}
          {currentView === 'memos' && (
            <MemosView 
              t={currentT} 
              data={data} 
              setSelectedMemo={setSelectedMemo} 
              setShowMemoModal={(val) => handleOpenModal(() => 
                setShowMemoModal(val)
              )} 
              setMemoType={setMemoType} 
              setTempTodos={setTempTodos} 
              handleDeleteMemo={handleDeleteMemoAsync} 
              currentLang={deviceLang} 
              openConfirm={openConfirm} 
            />
          )}
          
          {/* المشتريات */}
          {currentView === 'purchases' && (
            <PurchasesView 
              t={currentT} 
              data={data} 
              setSelectedSupply={setSelectedSupply} 
              setShowSupplyModal={(val) => handleOpenModal(() => 
                setShowSupplyModal(val)
              )} 
              handleConvertToExpense={(s) => updateAndSync(p => ({
                ...p, 
                expenses: [{...s, date: new Date().toISOString(), updatedAt: Date.now()}, ...p.expenses], 
                supplies: p.supplies.filter(x=>x.id!==s.id)
              }))} 
              handleDeleteSupply={handleDeleteSupplyAsync} 
              openConfirm={openConfirm} 
            />
          )}
          
          {/* المخزون */}
          {currentView === 'inventory' && (
            <InventoryView 
              t={currentT} 
              data={data} 
              setSelectedInventoryItem={setSelectedInventoryItem} 
              setShowInventoryModal={(val) => handleOpenModal(() => 
                setShowInventoryModal(val)
              )} 
              handleDeleteInventoryItem={handleDeleteInventoryItemAsync} 
              openConfirm={openConfirm} 
            />
          )}
          
          {/* المصروفات */}
          {currentView === 'expenses' && (
            <ExpensesView 
              t={currentT} 
              data={data} 
              setData={setData} 
              setSelectedExpense={setSelectedExpense} 
              setShowExpenseModal={(val) => handleOpenModal(() => 
                setShowExpenseModal(val)
              )} 
              handleDeleteExpense={handleDeleteExpenseAsync} 
              openConfirm={openConfirm} 
            />
          )}
          
          {/* طلبات المختبر */}
          {currentView === 'labOrders' && (
            <LabOrdersView 
              t={currentT} 
              data={data} 
              setData={setData} 
              setSelectedLabOrder={setSelectedLabOrder} 
              setShowLabOrderModal={(val) => handleOpenModal(() => 
                setShowLabOrderModal(val)
              )} 
              handleDeleteLabOrder={handleDeleteLabOrderAsync} 
              handleUpdateLabOrderStatus={(id, s) => updateAndSync(p => ({
                ...p, 
                labOrders: p.labOrders.map(o => 
                  o.id === id ? {...o, status: s, updatedAt: Date.now()} : o
                )
              }))} 
              openConfirm={confirmState.isOpen ? closeConfirm : openConfirm} 
              currentLang={deviceLang} 
            />
          )}
          
          {/* الإعدادات */}
          {currentView === 'settings' && (
            <SettingsView 
              t={currentT} 
              data={data} 
              setData={setData} 
              handleAddDoctor={(n,u,p) => updateAndSync(prev => ({
                ...prev, 
                doctors: [...prev.doctors, {
                  id: generateId(), 
                  name: n, 
                  username: u, 
                  password: p||'123456', 
                  updatedAt: Date.now()
                }]
              }))} 
              handleUpdateDoctor={(id, u, f) => { 
                if(f) { 
                  localStorage.clear(); 
                  window.location.reload(); 
                } else {
                  updateAndSync(prev => ({
                    ...prev, 
                    doctors: prev.doctors.map(d => 
                      d.id === id ? {...d, ...u, updatedAt: Date.now()} : d
                    )
                  })); 
                }
              }} 
              handleDeleteDoctor={handleDeleteDoctorAsync} 
              handleAddSecretary={(n,u,p) => updateAndSync(prev => ({
                ...prev, 
                secretaries: [...(prev.secretaries||[]), {
                  id: generateId(), 
                  name: n, 
                  username: u, 
                  password: p||'123456', 
                  updatedAt: Date.now()
                }]
              }))} 
              handleDeleteSecretary={handleDeleteSecretaryAsync} 
              handleRxFileUpload={handleRxFileUpload} 
              handleRemoveRxBg={handleRemoveRxBg} 
              handleImportData={async (e, m) => { 
                const imp = await storageService.importBackup(e.target.files![0]); 
                if(imp) { 
                  if(m==='replace') {
                    setData(mergeDataWithLocalPrefs({
                      ...imp, 
                      settings: {...imp.settings, isLoggedIn: true}
                    }));
                  } else {
                    setData(p => ({
                      ...p, 
                      patients: [...p.patients, ...imp.patients], 
                      lastUpdated: Date.now()
                    }));
                  }
                  alert('Done'); 
                } 
              }} 
              syncStatus={syncStatus} 
              deferredPrompt={deferredPrompt} 
              handleInstallApp={handleInstallApp} 
              openConfirm={openConfirm} 
              currentLang={deviceLang} 
              setDeviceLang={setDeviceLang} 
              currentTheme={activeThemeId === 'classic' ? 'light' : 'dark'} 
              setLocalTheme={(t) => setActiveThemeId(t === 'dark' ? 'dark-pro' : 'classic')} 
              activeThemeId={activeThemeId} 
              setActiveThemeId={setActiveThemeId} 
              activeDoctorId={activeDoctorId} 
              activeSecretaryId={activeSecretaryId} 
              deviceScale={deviceScale} 
              setDeviceScale={setDeviceScale} 
              onLinkDrive={handleLinkDrive} 
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </div>
      </main>


      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/*                            قوالب الطباعة                                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <PrintLayouts 
        t={currentT} 
        data={data} 
        activePatient={activePatient} 
        printingRx={printingRx} 
        setPrintingRx={setPrintingRx} 
        printingPayment={printingPayment} 
        setPrintingPayment={setPrintingPayment} 
        printingAppointment={printingAppointment} 
        setPrintingAppointment={setPrintingAppointment} 
        printingExamination={printingExamination} 
        setPrintingExamination={setPrintingExamination} 
        printingDocument={printingDocument} 
        setPrintingDocument={setPrintingDocument} 
        currentLang={deviceLang} 
        isRTL={isRTL} 
      />
      

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/*                          النوافذ المنبثقة                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* نافذة المريض (إضافة/تعديل) */}
      <PatientModal 
        show={showNewPatientModal || showEditPatientModal} 
        onClose={() => { 
          if(!isProcessingPatient) { 
            setShowNewPatientModal(false); 
            setShowEditPatientModal(false); 
          } 
        }} 
        t={currentT} 
        isRTL={isRTL} 
        currentLang={deviceLang} 
        data={data} 
        handleAddPatient={handleAddPatientAsync} 
        updatePatient={updatePatientAsync} 
        guestToConvert={guestToConvert} 
        activePatient={showEditPatientModal ? activePatient : null} 
        setSelectedPatientId={handleOpenPatient} 
        setCurrentView={setCurrentView} 
        setPatientTab={setPatientTab} 
        activeDoctorId={activeDoctorId} 
        isSaving={isProcessingPatient}
        error={opError}
      />
      
      {/* نافذة الدفع */}
      <PaymentModal 
        show={showPaymentModal} 
        onClose={() => { 
          if(!isProcessingFinance) setShowPaymentModal(false); 
        }} 
        t={currentT} 
        activePatient={activePatient} 
        paymentType={paymentType} 
        data={data} 
        selectedPayment={selectedPayment}
        handleSavePayment={(p: any, isEdit: boolean) => 
          handleSavePaymentAsync(activePatient!.id, p, isEdit)
        } 
        currentLang={deviceLang} 
        isSaving={isProcessingFinance} 
        error={opError} 
      />

      {/* نافذة الموعد */}
      <AppointmentModal 
        show={showAppointmentModal} 
        onClose={() => { 
          if(!isProcessingAppt) { 
            setShowAppointmentModal(false); 
            setApptPatientId(null); 
          } 
        }} 
        t={currentT} 
        selectedAppointment={selectedAppointment} 
        appointmentMode={appointmentMode} 
        setAppointmentMode={setAppointmentMode} 
        selectedPatientId={apptPatientId || (selectedPatientId && currentView === 'patients' ? selectedPatientId : null)} 
        data={data} 
        currentDate={currentDate} 
        handleAddAppointment={handleSaveAppointmentAsync} 
        isRTL={isRTL} 
        currentLang={deviceLang} 
        isSaving={isProcessingAppt} 
        error={opError} 
      />
      
      {/* نافذة إدارة الأدوية */}
      <AddMasterDrugModal 
        show={showAddMasterDrugModal} 
        onClose={() => setShowAddMasterDrugModal(false)} 
        t={currentT} 
        data={data} 
        setData={setData} 
        handleManageMedications={(m: any, a: any) => updateAndSync(p => ({
          ...p, 
          medications: a === 'add' 
            ? [...p.medications, {...m, id: generateId(), updatedAt: Date.now()}] 
            : p.medications.map(x => x.id===m.id ? {...m, updatedAt:Date.now()} : x)
        }))} 
        handleDeleteMasterDrug={(id) => updateAndSync(p => ({
          ...p, 
          medications: p.medications.filter(x => x.id !== id), 
          deletedIds: [...(p.deletedIds || []), id]
        }))} 
        currentLang={deviceLang} 
        openConfirm={openConfirm} 
      />
      
      {/* نافذة المذكرة */}
      <MemoModal 
        show={showMemoModal} 
        onClose={() => setShowMemoModal(false)} 
        t={currentT} 
        selectedMemo={selectedMemo} 
        memoType={memoType} 
        setMemoType={setMemoType} 
        tempTodos={tempTodos} 
        setTempTodos={setTempTodos} 
        handleSaveMemo={handleSaveMemo} 
        currentLang={deviceLang} 
      />
      
      {/* نافذة المشتريات */}
      <SupplyModal 
        show={showSupplyModal} 
        onClose={() => setShowSupplyModal(false)} 
        t={currentT} 
        selectedSupply={selectedSupply} 
        handleSaveSupply={async (n: any, q: any, pr: any) => { 
          const ts = Date.now(); 
          await updateAndSync(p => ({
            ...p, 
            supplies: selectedSupply 
              ? p.supplies.map(x => x.id===selectedSupply.id 
                  ? {...x, name:n, quantity:q, price:pr, updatedAt:ts} 
                  : x
                ) 
              : [{id:generateId(), name:n, quantity:q, price:pr, updatedAt:ts}, ...p.supplies]
          })); 
        }} 
        currentLang={deviceLang} 
      />
      
      {/* نافذة المخزون */}
      <InventoryModal 
        show={showInventoryModal} 
        onClose={() => setShowInventoryModal(false)} 
        t={currentT} 
        selectedItem={selectedInventoryItem} 
        handleSaveItem={async (i: any) => { 
          const ts = Date.now(); 
          await updateAndSync(p => ({
            ...p, 
            inventory: selectedInventoryItem 
              ? p.inventory.map(x => x.id===selectedInventoryItem.id 
                  ? {...x, ...i, updatedAt:ts} 
                  : x
                ) 
              : [{...i, id:generateId(), updatedAt:ts}, ...p.inventory]
          })); 
        }} 
        currentLang={deviceLang} 
      />
      
      {/* نافذة المصروفات */}
      <ExpenseModal 
        show={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)} 
        t={currentT} 
        selectedExpense={selectedExpense} 
        handleSaveExpense={async (n: any, q: any, pr: any, d: any) => { 
          const ts = Date.now(); 
          await updateAndSync(p => ({
            ...p, 
            expenses: selectedExpense 
              ? p.expenses.map(x => x.id===selectedExpense.id 
                  ? {...x, name:n, quantity:q, price:pr, date:d, updatedAt:ts} 
                  : x
                ) 
              : [{id:generateId(), name:n, quantity:q, price:pr, date:d, updatedAt:ts}, ...p.expenses]
          })); 
        }} 
        currentLang={deviceLang} 
      />
      
      {/* نافذة طلب المختبر */}
      <LabOrderModal 
        show={showLabOrderModal} 
        onClose={() => setShowLabOrderModal(false)} 
        t={currentT} 
        data={data} 
        selectedLabOrder={selectedLabOrder} 
        handleSaveLabOrder={async (o: any) => { 
          const ts = Date.now(); 
          await updateAndSync(p => ({
            ...p, 
            labOrders: selectedLabOrder 
              ? p.labOrders.map(x => x.id===selectedLabOrder.id 
                  ? {...x, ...o, updatedAt:ts} 
                  : x
                ) 
              : [{...o, id:generateId(), updatedAt:ts}, ...p.labOrders]
          })); 
        }} 
        currentLang={deviceLang} 
      />
      
      {/* نافذة الوصفة الطبية */}
      <PrescriptionModal 
        show={showRxModal} 
        onClose={() => { 
          if(!isProcessingRx) setShowRxModal(false); 
        }} 
        t={currentT} 
        data={data} 
        patient={activePatient} 
        currentLang={deviceLang} 
        isRTL={isRTL} 
        handleSave={handleSaveRxAsync} 
        isSaving={isProcessingRx}
      />
    </div>
  );
}
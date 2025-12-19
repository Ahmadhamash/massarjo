// Global Variables
let allPackagesData = []; 
let allMentorsData = []; 

const API_BASE_URL = "/api";

// Global Variables
let currentUser = null;
let selectedPackage = null;
let selectedMentor = null;

// Holland Assessment Variables
let currentQuestionIndex = 0;
let hollandAnswers = [];
let hollandQuestions = [];

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function() {
    checkAuthStatus();
    initializeEventListeners();
    initializeRestOfFunctionality();
    loadInitialData();
});

// Load Initial Data Functions
async function loadInitialData() {
    await loadPackages();
    await loadMentors();
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}


// mind.js

async function deletePackage(packageId) {
    if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
        try {
            const token = localStorage.getItem('token'); // <-- جلب التوكن

            const response = await fetch(`${API_BASE_URL}/admin/packages/${packageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // <-- السطر الأهم: إرسال التوكن
                }
            });
            const result = await response.json();
            if (result.success) {
                showNotification('تم الحذف بنجاح', 'success');
                loadAdminPackages(); // إعادة تحميل القائمة بعد الحذف
            } else {
                showNotification(result.message || 'فشل الحذف', 'error');
            }
        } catch (error) {
            showNotification('خطأ في الاتصال بالسيرفر', 'error');
        }
    }
}

// mind.js

// mind.js

function updateUIForLoggedInUser() {
    // 1. زر الكمبيوتر (كما هو)
    const desktopLoginBtn = document.querySelector('.hidden.md\\:block [onclick="openLoginModal()"]');
    if (desktopLoginBtn) {
        desktopLoginBtn.outerHTML = `
            <div class="relative">
                <button onclick="toggleUserMenu('desktop')" class="flex items-center gap-2 font-semibold transition-colors" style="color: var(--text-dark);">
                    <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span class="hidden md:inline">${currentUser.name}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="userDropdownDesktop" class="hidden absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div class="p-3 border-b">
                        <p class="font-semibold text-sm text-gray-800">${currentUser.name}</p>
                    </div>
                    <a href="javascript:void(0)" onclick="showUserProfile(); toggleUserMenu('desktop');" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">الملف الشخصي</a>
                    <a href="javascript:void(0)" onclick="showUserSessions(); toggleUserMenu('desktop');" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">جلساتي</a>
                    <a href="javascript:void(0)" onclick="showUserOrders(); toggleUserMenu('desktop');" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">طلباتي</a>
                    <div class="border-t">
                        <a href="javascript:void(0)" onclick="logout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">تسجيل الخروج</a>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. زر الموبايل (التعديل الكبير هنا)
    const mobileLoginBtn = document.querySelector('.md\\:hidden [onclick="openLoginModal()"]');
    if (mobileLoginBtn) {
        mobileLoginBtn.outerHTML = `
            <div class="relative">
                <button onclick="toggleUserMenu('mobile')" class="flex items-center gap-2 font-semibold transition-colors">
                    <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </div>
                </button>
                
                <div id="userDropdownMobile" class="hidden fixed top-20 left-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" style="z-index: 200000 !important; background-color: white !important;">
                    
                    <div class="p-4 border-b border-gray-100 bg-gray-50">
                        <p class="font-bold text-base text-gray-900" style="color: #111827 !important;">${currentUser.name}</p>
                        <p class="text-xs text-gray-500 truncate" style="color: #6b7280 !important;">${currentUser.email}</p>
                    </div>

                    <div class="flex flex-col">
                        <a href="javascript:void(0)" onclick="handleMobileAction('profile')" 
                           class="block w-full text-right px-4 py-3 text-sm border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                           style="background-color: white !important; color: #374151 !important;">
                           👤 الملف الشخصي
                        </a>

                        <a href="javascript:void(0)" onclick="handleMobileAction('sessions')" 
                           class="block w-full text-right px-4 py-3 text-sm border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                           style="background-color: white !important; color: #374151 !important;">
                           📅 جلساتي
                        </a>

                        <a href="javascript:void(0)" onclick="handleMobileAction('orders')" 
                           class="block w-full text-right px-4 py-3 text-sm border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                           style="background-color: white !important; color: #374151 !important;">
                           🛍️ طلباتي
                        </a>
                    </div>

                    <div class="bg-red-50 p-2">
                        <a href="javascript:void(0)" onclick="handleMobileAction('logout')" 
                           class="block w-full text-right px-4 py-2 text-sm font-bold rounded hover:bg-red-100 transition-colors"
                           style="color: #dc2626 !important; background-color: transparent !important;">
                           🚪 تسجيل الخروج
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

// دالة مساعدة للتعامل مع أزرار الموبايل بضمان العمل
function handleMobileAction(action) {
    // 1. إغلاق القائمة أولاً
    const mobileMenu = document.getElementById('userDropdownMobile');
    if (mobileMenu) mobileMenu.classList.add('hidden');

    // 2. تنفيذ الأمر المطلوب بعد مهلة قصيرة جداً لضمان إغلاق القائمة
    setTimeout(() => {
        if (action === 'profile') showUserProfile();
        if (action === 'sessions') showUserSessions();
        if (action === 'orders') showUserOrders();
        if (action === 'logout') logout();
    }, 100);
}

// دالة جديدة لتشغيل زر المنيو (Hamburger) بشكل مضمون
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerBtn = document.getElementById('hamburger-button');
    
    if (mobileMenu) {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // منع السكرول للخلفية
        } else {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
}

// mind.js

function initializeEventListeners() {
    // 1. إصلاح زر المنيو (Hamburger) - الكود الجديد
    const hamburgerBtn = document.getElementById('hamburger-button');
    if (hamburgerBtn) {
        hamburgerBtn.onclick = function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        };
    }

    // 2. إغلاق القوائم عند النقر خارجها
    document.addEventListener('click', function(e) {
        // إغلاق قائمة المستخدم
        if (!e.target.closest('[onclick^="toggleUserMenu"]') && !e.target.closest('#userDropdownMobile')) {
            const mMenu = document.getElementById('userDropdownMobile');
            const dMenu = document.getElementById('userDropdownDesktop');
            if (mMenu && !mMenu.classList.contains('hidden')) mMenu.classList.add('hidden');
            if (dMenu && !dMenu.classList.contains('hidden')) dMenu.classList.add('hidden');
        }
        
        // إغلاق قائمة المنيو الجانبية عند النقر على الروابط
        if (e.target.closest('.mobile-nav-link')) {
            toggleMobileMenu();
        }
    });

    // 3. التبديل بين تسجيل الدخول وإنشاء الحساب (مهم جداً)
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('signup-form-container').style.display = 'block';
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
    });

    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // تغيير نص الزر ليدل على التحميل
    const btn = this.querySelector('button');
    const oldText = btn.textContent;
    btn.textContent = 'جاري التحقق...';
    btn.disabled = true;

    fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(result => {
        if (result.token) {
            localStorage.setItem('token', result.token);
            currentUser = result.user;
            closeLoginModal();
            updateUIForLoggedInUser();
            
            if (currentUser.role === 'admin') {
                // أدمن → افتح لوحة التحكم
                openAdminPanel();
                showNotification('مرحباً أيها المدير!', 'success');
            } else if (currentUser.role === 'mentor') {
                // مرشد → تحويل إلى لوحة المرشد
                showNotification(`مرحباً بك ${currentUser.name}!`, 'success');
                window.location.href = 'mentor-dashboard.html';
            } else {
                // مستخدم عادي
                showNotification(`مرحباً بك ${currentUser.name}!`, 'success');
            }
        } else {
            showNotification(result.message || 'بيانات الدخول خاطئة', 'error');
        }
    })
    .catch(() => {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    })
    .finally(() => {
        btn.textContent = oldText;
        btn.disabled = false;
    });
});

    // 5. معالجة نموذج إنشاء حساب جديد (Signup Form Handler)
    document.getElementById('signupForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        .then(res => res.json())
        .then(result => {
            if (result.token) {
                localStorage.setItem('token', result.token);
                currentUser = result.user;
                closeLoginModal();
                updateUIForLoggedInUser();
                showNotification(`مرحباً بك ${currentUser.name}! تم إنشاء حسابك بنجاح.`, 'success');
            } else {
                showNotification(result.message || 'لم يتم إنشاء الحساب', 'error');
            }
        })
        .catch(() => {
            showNotification('خطأ في الاتصال بالخادم', 'error');
        });
    });

    // 6. اختيار طريقة الدفع
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // 7. معالجة نموذج الشراء (Purchase Form)
    document.getElementById('purchaseForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            showNotification('يرجى تسجيل الدخول أولاً', 'error');
            openLoginModal();
            return;
        }

        const formData = new FormData(this);
        const paymentMethod = document.querySelector('.payment-method.selected')?.dataset.method;

        if (!paymentMethod) {
            showNotification('يرجى اختيار طريقة الدفع', 'error');
            return;
        }

        const orderData = {
            packageId: selectedPackage.id, // تأكد أن selectedPackage معرفة
            mentorId: selectedMentor?._id || null,
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            preferredTime: formData.get('preferredTime') || '',
            notes: formData.get('goals') || '', // تأكد من اسم الحقل في HTML
            paymentMethod: paymentMethod
        };

        fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                showNotification('تم إرسال طلبك بنجاح!', 'success');
                closePurchasePage();
                this.reset();
            } else {
                showNotification(result.message || 'فشل الطلب', 'error');
            }
        })
        .catch(() => {
            showNotification('خطأ في الاتصال', 'error');
        });
    });
}

async function loadPackages() {
    try {
        // --- START: The Definitive Cache-Busting Fix ---
        // We are adding headers to explicitly tell the browser AND any proxy 
        // not to use a cached version of this request. This is the most reliable method.
        const response = await fetch(`${API_BASE_URL}/packages`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        // --- END: The Definitive Cache-Busting Fix ---

        const result = await response.json();
        if (result.success) {
            // For debugging: This will show the newly loaded data in the browser console
            console.log("Fresh package data loaded:", result.packages); 
            
            allPackagesData = result.packages;
            updatePublicPackages(allPackagesData);
        }
    } catch (error) {
        console.error('Failed to load packages:', error);
    }
}

// === قسم المرشدين في الصفحة الرئيسية ===

// تُستدعى من loadInitialData()
async function loadMentors() {
    try {
        const response = await fetch(`${API_BASE_URL}/mentors`);
        const result = await response.json();
        if (result.success) {
            allMentorsData = result.mentors;
            renderPublicMentors(allMentorsData);
        }
    } catch (error) {
        console.error('Failed to load mentors:', error);
    }
}

function renderPublicMentors(mentors) {
    const mentorGridEl = document.getElementById('mentors-grid');
    if (!mentorGridEl) return;

    mentorGridEl.innerHTML = mentors.map(mentor => {
        const avatarUrl =
            mentor.avatar && mentor.avatar.trim()
                ? mentor.avatar
                : 'https://placehold.co/128x128/e0e7ff/4338ca?text=' +
                  encodeURIComponent(mentor.name ? mentor.name.charAt(0) : 'م');

        return `
      <div class="swiper-slide !w-[280px] md:!w-[320px] h-auto">
        <div
          class="p-6 rounded-2xl text-center h-full flex flex-col items-center cursor-pointer"
          style="background: var(--background-secondary);"
          onclick="showMentorProfile('${mentor._id}')"
        >
          <img
            draggable="false"
            src="${avatarUrl}"
            alt="${mentor.name}"
            class="w-28 h-28 rounded-full mx-auto mb-4 object-cover"
            style="border: 4px solid var(--border-color);"
          >
          <h4 class="font-bold text-xl text-white">${mentor.name}</h4>
          <p class="text-slate-400 text-sm mt-2 flex-grow">${mentor.title || ''}</p>
        </div>
      </div>
    `;
    }).join('');

    // إعادة تهيئة السلايدر
    if (mentorGridEl.swiper) {
        mentorGridEl.swiper.destroy(true, true);
    }

    new Swiper('.mentorSwiper', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        grabCursor: true,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        }
    });
}

// تُستدعى لما المستخدم يضغط على كرت المرشد
function showMentorProfile(mentorId) {
    const mentor = allMentorsData.find(m => m._id === mentorId);
    if (!mentor) return;

    // نخزن بيانات المرشد عشان نستخدمها في صفحة البروفايل / الداشبورد
    localStorage.setItem('selectedMentor', JSON.stringify(mentor));

    // نروح على صفحة بروفايل المرشد
    window.location.href = `mentor-profile.html?id=${mentorId}`;
}









// Authentication Functions
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(result => {
            if (result.user) {
                currentUser = result.user;
                updateUIForLoggedInUser();
            } else {
                localStorage.removeItem('token');
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
        });
    }
}



// دالة فتح القائمة المحدثة
function toggleUserMenu(type) {
    // إغلاق أي قائمة مفتوحة أولاً
    const desktopMenu = document.getElementById('userDropdownDesktop');
    const mobileMenu = document.getElementById('userDropdownMobile');
    
    if (type === 'mobile' && mobileMenu) {
        if (desktopMenu) desktopMenu.classList.add('hidden'); // إخفاء الأخرى
        mobileMenu.classList.toggle('hidden');
    } else if (desktopMenu) {
        if (mobileMenu) mobileMenu.classList.add('hidden'); // إخفاء الأخرى
        desktopMenu.classList.toggle('hidden');
    }
}

// دالة مساعدة لإغلاق القوائم عند النقر في أي مكان آخر (أضفها لـ initializeEventListeners)
document.addEventListener('click', function(e) {
    if (!e.target.closest('[onclick^="toggleUserMenu"]')) {
        const mMenu = document.getElementById('userDropdownMobile');
        const dMenu = document.getElementById('userDropdownDesktop');
        if (mMenu && !mMenu.classList.contains('hidden')) mMenu.classList.add('hidden');
        if (dMenu && !dMenu.classList.contains('hidden')) dMenu.classList.add('hidden');
    }
});

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    showNotification('تم تسجيل الخروج بنجاح', 'info');
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// 1. دالة عرض الملف الشخصي
function showUserProfile() {
    // إغلاق القوائم سواء كانت نسخة الموبايل أو الكمبيوتر
    const dMenu = document.getElementById('userDropdownDesktop');
    const mMenu = document.getElementById('userDropdownMobile');
    
    if (dMenu) dMenu.classList.add('hidden');
    if (mMenu) mMenu.classList.add('hidden');
    
    // فتح النافذة المنبثقة
    openUserProfileModal();
}

function showUserSessions() {
    console.log("تم الضغط على زر جلساتي"); // للتأكد من أن الزر يعمل

    // إغلاق القوائم المنسدلة (للموبايل والكمبيوتر)
    const dMenu = document.getElementById('userDropdownDesktop');
    const mMenu = document.getElementById('userDropdownMobile');
    
    if (dMenu) dMenu.classList.add('hidden');
    if (mMenu) mMenu.classList.add('hidden');

    // فتح النافذة
    openUserSessionsModal();
}

// 3. دالة عرض الطلبات (التي تظهر الخطأ في الصورة)
function showUserOrders() {
    const dMenu = document.getElementById('userDropdownDesktop');
    const mMenu = document.getElementById('userDropdownMobile');
    
    if (dMenu) dMenu.classList.add('hidden');
    if (mMenu) mMenu.classList.add('hidden');

    openUserOrdersModal();
}

// User Profile Modal
function openUserProfileModal() {
    const modal = document.createElement('div');
    modal.id = 'userProfileModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" onclick="closeUserProfileModal()">&times;</button>
            <h2 class="text-2xl font-bold mb-6 text-center" style="color: var(--text-dark);">الملف الشخصي</h2>
            
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
                    ${currentUser.name.charAt(0).toUpperCase()}
                </div>
                <h3 class="text-xl font-bold" style="color: var(--text-dark);">${currentUser.name}</h3>
                <p class="text-gray-600">${currentUser.email}</p>
            </div>

            <form id="updateProfileForm">
                <div class="form-group">
                    <label for="updateName">الاسم الكامل</label>
                    <input type="text" id="updateName" value="${currentUser.name}" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="updateEmail">البريد الإلكتروني</label>
                    <input type="email" id="updateEmail" value="${currentUser.email}" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="updatePhone">رقم الهاتف</label>
                    <input type="tel" id="updatePhone" value="${currentUser.phone || ''}" class="form-control">
                </div>
                <div class="flex gap-4">
                    <button type="submit" class="btn-primary flex-1">حفظ التغييرات</button>
                    <button type="button" onclick="closeUserProfileModal()" class="btn-secondary">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('updateProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateUserProfile();
    });
}

function closeUserProfileModal() {
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.remove();
    }
}

function updateUserProfile() {
    const name = document.getElementById('updateName').value;
    const email = document.getElementById('updateEmail').value;
    const phone = document.getElementById('updatePhone').value;

    fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            currentUser = { ...currentUser, name, email, phone };
            updateUIForLoggedInUser();
            closeUserProfileModal();
            showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
        } else {
            showNotification(result.message || 'فشل في تحديث الملف الشخصي', 'error');
        }
    })
    .catch(() => {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    });
}


// mind.js

// ========================================================================
// ✅  الكود الخاص بنافذة إضافة وتعديل الجلسات
// ========================================================================

// متغير عام لتخزين بيانات المستخدمين عند جلبها لتجنب الطلبات المتكررة
let allAdminUsersData = [];

/**
 * تفتح نافذة "إضافة جلسة جديدة" وتجهزها.
 */
async function openAddSessionModal() {
    document.getElementById('addSessionForm').reset();
    document.getElementById('sessionModalTitle').textContent = 'إضافة جلسة جديدة';
    document.getElementById('sessionFormSubmitBtn').textContent = 'إضافة الجلسة';
    document.getElementById('editSessionId').value = '';

    // جلب بيانات المستخدمين والمرشدين لملء القوائم المنسدلة
    await populateSessionModalDropdowns();

    // إظهار النافذة المنبثقة
    openAdminModal('addSessionModal');
}

/**
 * تجلب بيانات المستخدمين والمرشدين وتملأ القوائم المنسدلة في النموذج.
 */
async function populateSessionModalDropdowns() {
    const token = localStorage.getItem('token');
    const userSelect = document.getElementById('sessionUser');
    const mentorSelect = document.getElementById('sessionMentor');
    userSelect.innerHTML = '<option>جاري التحميل...</option>';
    mentorSelect.innerHTML = '<option>جاري التحميل...</option>';

    try {
        // جلب المستخدمين
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const usersResult = await usersRes.json();
        if (usersResult.success) {
            allAdminUsersData = usersResult.users; // تخزين بيانات المستخدمين في المتغير العام
            userSelect.innerHTML = '<option value="">-- اختر مستخدم --</option>';
            userSelect.innerHTML += allAdminUsersData.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
        }

        // جلب المرشدين
        const mentorsRes = await fetch(`${API_BASE_URL}/admin/mentors`, { headers: { 'Authorization': `Bearer ${token}` } });
        const mentorsResult = await mentorsRes.json();
        if (mentorsResult.success) {
            mentorSelect.innerHTML = '<option value="">-- اختر مرشد --</option>';
            mentorSelect.innerHTML += mentorsResult.mentors.map(m => `<option value="${m._id}">${m.name}</option>`).join('');
        }
    } catch (error) {
        console.error("Failed to populate session modal dropdowns:", error);
        userSelect.innerHTML = '<option value="">فشل تحميل المستخدمين</option>';
        mentorSelect.innerHTML = '<option value="">فشل تحميل المرشدين</option>';
    }
}

// إضافة مستمع أحداث لملء رقم الهاتف تلقائياً عند اختيار مستخدم
document.getElementById('sessionUser')?.addEventListener('change', (e) => {
    const selectedUserId = e.target.value;
    const phoneInput = document.getElementById('sessionUserPhone');
    const selectedUser = allAdminUsersData.find(user => user._id === selectedUserId);
    
    if (selectedUser && selectedUser.phone) {
        phoneInput.value = selectedUser.phone;
    } else {
        phoneInput.value = ''; // إفراغ الحقل إذا لم يكن للمستخدم رقم هاتف
    }
});

function openUserSessionsModal() {
    const modal = document.getElementById('userSessionsModal');
    if (modal) {
        modal.classList.add('active'); // إظهار النافذة
        loadUserSessions(); // بدء تحميل البيانات من السيرفر
    } else {
        console.error("خطأ: لم يتم العثور على عنصر userSessionsModal في ملف HTML");
        alert("حدث خطأ في النظام: نافذة الجلسات غير موجودة.");
    }
}

function closeUserSessionsModal() {
    const modal = document.getElementById('userSessionsModal');
    if (modal) {
        modal.classList.remove('active'); // إخفاء فقط دون حذف
    }
}

async function loadUserSessions(filter = 'all') {
    const container = document.getElementById('userSessionsContainer');
    if (!container) return;

    // عرض مؤشر التحميل
    container.innerHTML = `
        <div class="text-center py-8">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p>جاري تحميل الجلسات...</p>
        </div>`;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            container.innerHTML = '<p class="text-center text-red-500">يرجى تسجيل الدخول أولاً.</p>';
            return;
        }

        // الاتصال بالسيرفر (الآن الرابط والترتيب صحيحان في الباك إند)
        const response = await fetch(`${API_BASE_URL}/sessions/my-sessions`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // التحقق من حالة الاستجابة
        if (!response.ok) {
            if (response.status === 403) throw new Error("غير مصرح لك بالوصول (403)");
            if (response.status === 404) throw new Error("الرابط غير موجود (404)");
            if (response.status === 500) throw new Error("خطأ في الخادم (500)");
            throw new Error(`خطأ غير معروف: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            let sessions = result.sessions;
            // تصفية حسب التبويب المختار
            if (filter !== 'all') {
                sessions = sessions.filter(s => s.status === filter);
            }
            displayUserSessions(sessions);
        } else {
            container.innerHTML = `<div class="text-center py-8"><p class="text-red-500">${result.message || 'فشل تحميل الجلسات'}</p></div>`;
        }
    } catch (error) {
        console.error("Error loading sessions:", error);
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500 font-bold">حدث خطأ أثناء الاتصال</p>
                <p class="text-sm text-gray-500 mt-2">${error.message}</p>
                <button onclick="loadUserSessions()" class="mt-4 text-indigo-600 hover:underline">إعادة المحاولة</button>
            </div>`;
    }
}


// ابحث عن دالة displayUserSessions واستبدلها أو عدل السطر الأول فيها
function displayUserSessions(sessions) {
    const container = document.getElementById('userSessionsContainer');
    if (!container) return;
    
    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
                <i class="fas fa-calendar-times text-4xl text-slate-500 mb-3"></i>
                <p style="color: var(--text-light);">لا توجد جلسات في هذا القسم.</p>
                <button onclick="closeUserSessionsModal(); window.location.href='#packages'" class="mt-4 text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                    احجز جلسة جديدة
                </button>
            </div>`;
        return;
    }

    container.innerHTML = sessions.map(session => {
        const sessionDate = new Date(session.scheduledDate);
        const formattedDate = sessionDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = sessionDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

        return `
        <div class="session-card relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-1 h-full bg-${getStatusColor(session.status)}"></div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="status-badge status-${session.status} text-xs">${getSessionStatusText(session.status)}</span>
                        <span class="text-xs text-slate-500">#${session._id.slice(-6)}</span>
                    </div>
                    <h4 class="font-bold text-lg text-white mb-1">${session.title || 'جلسة إرشادية'}</h4>
                    <p class="text-sm text-slate-400 flex items-center gap-2">
                        <i class="fas fa-user-tie"></i>
                        مع المرشد: <span class="text-indigo-400">${session.mentor ? session.mentor.name : 'غير محدد'}</span>
                    </p>
                </div>

                <div class="flex flex-col gap-2 text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg min-w-[200px]">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-calendar text-indigo-500 w-5 text-center"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clock text-indigo-500 w-5 text-center"></i>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-hourglass-half text-indigo-500 w-5 text-center"></i>
                        <span>${session.duration || 60} دقيقة</span>
                    </div>
                </div>

            </div>
        </div>
        `;
    }).join('');
}
function getStatusColor(status) {
    const colors = {
        'scheduled': 'blue-500',
        'in_progress': 'yellow-500',
        'completed': 'green-500',
        'cancelled': 'red-500'
    };
    return colors[status] || 'gray-500';
}

function getSessionStatusText(status) {
    const statusMap = {
        'scheduled': '📅 مجدولة',
        'in_progress': '⏳ جارية الآن',
        'completed': '✅ مكتملة',
        'cancelled': '❌ ملغية',
        'no_show': '🚫 لم يحضر'
    };
    return statusMap[status] || status;
}




function showMentorProfile(mentorId) {
  const mentor = allMentorsData.find(m => m._id === mentorId);
  if (!mentor) {
    if (typeof showNotification === 'function') {
      showNotification('لم يتم العثور على بيانات المرشد', 'error');
    } else {
      console.error('Mentor not found', mentorId);
    }
    return;
  }

  // لو كان في مودال قديم، احذفيه
  const oldModal = document.getElementById('mentorProfileModal');
  if (oldModal) oldModal.remove();

  const avatarUrl =
    mentor.avatar && mentor.avatar.trim()
      ? mentor.avatar
      : 'https://placehold.co/200x200/e0e7ff/4338ca?text=' +
        encodeURIComponent(mentor.name ? mentor.name.charAt(0) : 'م');

  const modal = document.createElement('div');
  modal.id = 'mentorProfileModal';
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content mentor-profile-modal" style="max-width: 600px;">
      <button class="close-modal" onclick="closeMentorProfile()">&times;</button>

      <div class="mentor-profile-header">
        <img src="${avatarUrl}" alt="${mentor.name}" class="mentor-profile-avatar">
        <h2 class="text-3xl font-bold mt-4" style="color: var(--text-dark);">${mentor.name}</h2>
        <p class="text-lg mt-2" style="color: var(--primary);">${mentor.title || 'مرشد مهني'}</p>
      </div>

      <div class="mentor-profile-body">
        <div class="mentor-info-grid">
          <div class="mentor-info-item">
            <i class="fas fa-briefcase mentor-info-icon"></i>
            <div>
              <p class="mentor-info-label">سنوات الخبرة</p>
              <p class="mentor-info-value">${mentor.experience || 'غير محدد'}</p>
            </div>
          </div>

          <div class="mentor-info-item">
            <i class="fas fa-star mentor-info-icon"></i>
            <div>
              <p class="mentor-info-label">التخصص</p>
              <p class="mentor-info-value">${mentor.specialty || 'الإرشاد المهني'}</p>
            </div>
          </div>
        </div>

        <div class="mentor-bio-section">
          <h3 class="text-xl font-bold mb-3" style="color: var(--text-dark);">
            <i class="fas fa-user-circle ml-2"></i>نبذة تعريفية
          </h3>
          <p class="mentor-bio-text">${mentor.bio || 'لا توجد نبذة تعريفية متاحة.'}</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeMentorProfile() {
  const modal = document.getElementById('mentorProfileModal');
  if (modal) {
    modal.remove();
  }
}


function closeMentorProfile() {
    const modal = document.getElementById('mentorProfileModal');
    if (modal) {
        modal.remove();
    }
}

// mind.js

// (تعديل)
function openUserOrdersModal() {
    const modal = document.createElement('div');
    modal.id = 'userOrdersModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <button class="close-modal" onclick="closeUserOrdersModal()">&times;</button>
            <h2 class="text-2xl font-bold mb-6" style="color: var(--text-dark);">طلباتي</h2>
            <div id="ordersContainer">
                <div class="text-center py-8">
                    <div class="loading-spinner mx-auto mb-4"></div>
                    <p>جاري تحميل الطلبات...</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // ✅ --- START: التعديل هنا --- ✅
    // نقوم بتنظيف الحاوية أولاً
   // الحاوية التي سنرسم بداخلها
const container = document.getElementById('ordersContainer');
container.innerHTML = `
    <div class="text-center py-8">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p>جاري تحميل الطلبات...</p>
    </div>
`;

// نجلب طلبات الباقات + طلبات الـ CV معًا
Promise.all([
    loadUserOrders_Internal(),
    loadUserCvRequests_Internal()
]).then(([orders, cvRequests]) => {
    container.innerHTML = '';
    let hasContent = false;

    // طلبات الباقات
    if (orders && orders.length > 0) {
        hasContent = true;
        container.innerHTML += orders.map(order => `
            <div class="border rounded-lg p-4 mb-4" style="background: var(--card-bg);">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-lg" style="color: var(--text-dark);">
                            ${order.packageName || (order.package ? order.package.name : 'باقة غير محددة')}
                        </h4>
                        <p class="text-sm text-gray-400">تاريخ الطلب: ${formatDate(order.createdAt)}</p>
                    </div>
                    <span class="status-badge status-${order.status}">
                        ${getOrderStatusText(order.status)}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><p><strong>المرشد:</strong> ${order.mentorName || (order.mentor ? order.mentor.name : 'غير محدد')}</p></div>
                    <div><p><strong>المبلغ:</strong> ${order.packagePrice || order.totalAmount} د.أ</p></div>
                </div>
            </div>
        `).join('');
    }

    // طلبات السيرة الذاتية
    if (cvRequests && cvRequests.length > 0) {
        hasContent = true;
        container.innerHTML += cvRequests.map(req => `
            <div class="border rounded-lg p-4 mb-4" style="background: var(--card-bg);">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-lg" style="color: var(--text-dark);">
                            طلب خدمة: ${req.packageName}
                        </h4>
                        <p class="text-sm text-gray-400">تاريخ الطلب: ${formatDate(req.createdAt)}</p>
                    </div>
                    <span class="status-badge status-${req.status}">
                        ${getCvRequestStatusText(req.status)}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><p><strong>المبلغ:</strong> ${req.packagePrice} د.أ</p></div>
                    <div><p><strong>الهاتف:</strong> ${req.phone}</p></div>
                </div>
            </div>
        `).join('');
    }

    if (!hasContent) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p style="color: var(--text-light);">لا توجد أي طلبات حالياً.</p>
            </div>
        `;
    }
}).catch(error => {
    console.error('Error loading user requests:', error);
    container.innerHTML = `
        <div class="text-center py-8">
            <p class="text-red-500">حدث خطأ في تحميل طلباتك.</p>
        </div>
    `;
});

    // ✅ --- END: التعديل هنا --- ✅
}

function closeUserOrdersModal() {
    const modal = document.getElementById('userOrdersModal');
    if (modal) {
        modal.remove();
    }
}



function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغي',
        'processing': 'قيد المعالجة',
        'delivered': 'تم التوصيل'
    };
    return statusMap[status] || status;
}


function getPaymentStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'paid': 'مدفوع',
        'failed': 'فشل الدفع',
        'refunded': 'مسترجع'
    };
    return statusMap[status] || status;
}
// mind.js
// تجيب طلبات الباقات وترجعها كمصفوفة
async function loadUserOrders_Internal() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('لم يتم تسجيل الدخول');
    }

    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    console.log('Orders response:', result);

    if (result.success && Array.isArray(result.orders)) {
        return result.orders;
    }

    return [];
}


// mind.js

// تحديث دالة عرض الطلبات
function displayUserOrders(orders) {
    const container = document.getElementById('ordersContainer');

    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="text-center py-8"><p>لا توجد طلبات.</p></div>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="border rounded-lg p-4 mb-4" style="background: var(--card-bg);">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-lg">طلب رقم #${order._id.slice(-6)}</h4>
                    <p class="text-sm text-gray-600">${order.package ? order.package.name : 'باقة غير محددة'}</p>
                </div>
                <span class="status-badge status-${order.status}">${getOrderStatusText(order.status)}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p><strong>تاريخ الطلب:</strong> ${formatDate(order.createdAt)}</p>
                    <p><strong>المرشد:</strong> ${order.mentor ? order.mentor.name : 'غير محدد'}</p>
                </div>
                <div>
                    <p><strong>المبلغ:</strong> ${order.totalAmount} ريال</p>
                    <p><strong>حالة الدفع:</strong> ${getPaymentStatusText(order.paymentStatus)}</p>
                </div>
            </div>
        </div>
    `).join('');
}




// mind.js

async function loadAdminOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">جاري تحميل الطلبات...</td></tr>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.orders.length > 0) {
            tbody.innerHTML = '';
            result.orders.forEach(order => {
                const row = document.createElement('tr');
                
                const mentorName = order.mentor ? order.mentor.name : '<em>لم يحدد</em>';
                const customerName = order.user ? order.user.name : (order.customerInfo ? order.customerInfo.name : '<em>زائر</em>');
                const packageName = order.package ? order.package.name : '<em>باقة محذوفة</em>';

                // --- السطر الجديد والمهم ---
                // يعطي الأولوية لرقم هاتف المستخدم المسجل، ثم الرقم المدخل في الطلب
                const customerPhone = (order.user && order.user.phone) ? order.user.phone : (order.customerInfo ? order.customerInfo.phone : '<em>لا يوجد</em>');
                
                const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];
                const statusDropdown = `<select class="admin-table-select" onchange="updateOrderField('${order._id}', 'status', this.value)">
                    ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${getOrderStatusText(s)}</option>`).join('')}
                </select>`;

                const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded'];
                const paymentDropdown = `<select class="admin-table-select" onchange="updateOrderField('${order._id}', 'paymentStatus', this.value)">
                    ${paymentStatusOptions.map(ps => `<option value="${ps}" ${order.paymentStatus === ps ? 'selected' : ''}>${getPaymentStatusText(ps)}</option>`).join('')}
                </select>`;

                row.innerHTML = `
                    <td>#${order._id.slice(-6)}</td>
                    <td>${customerName}</td>
                    <td>${customerPhone}</td>
                    <td>${packageName}</td>
                    <td>${mentorName}</td>
                    <td>${order.totalAmount} ريال</td>
                    <td>${new Date(order.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td>${statusDropdown}</td>
                    <td>${paymentDropdown}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد طلبات لعرضها.</td></tr>';
        }
    } catch (error) {
        console.error("Failed to load orders:", error);
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-red-500">فشل في تحميل الطلبات.</td></tr>`;
    }
}

/**
 * دالة لتحديث حقل معين في الطلب (الحالة أو حالة الدفع).
 * @param {string} orderId - معرف الطلب
 * @param {string} field - اسم الحقل (status أو paymentStatus)
 * @param {string} value - القيمة الجديدة
 */
async function updateOrderField(orderId, field, value) {
    try {
        const token = localStorage.getItem('token');
        const body = { [field]: value };

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('تم تحديث حالة الطلب بنجاح', 'success');
        } else {
            // إذا فشل التحديث، نعرض رسالة خطأ ونعيد تحميل البيانات لضمان عدم بقاء الحالة الخاطئة
            showNotification(result.message || 'فشل تحديث الحالة', 'error');
            loadAdminOrders();
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
        loadAdminOrders();
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Tree Plan Functions
function openTreePlan() {
    document.getElementById('treePlanPage').classList.add('active');
}

function closeTreePlan() {
    document.getElementById('treePlanPage').classList.remove('active');
}

// Holland Assessment Functions
function openHollandAssessment() {
    document.getElementById('hollandAssessmentPage').classList.add('active');
    initializeHollandQuestions();
    showHollandQuestion();
}

function closeHollandAssessment() {
    document.getElementById('hollandAssessmentPage').classList.remove('active');
    currentQuestionIndex = 0;
    hollandAnswers = [];
    const resultsContainer = document.getElementById('hollandResultsContainer');
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    document.getElementById('hollandQuestionContainer').style.display = 'block';
}

function initializeHollandQuestions() {
    hollandQuestions = [
        // Realistic (R) Questions
        { text: "أستمتع بالعمل بيدي وإصلاح الأشياء", type: "R" },
        { text: "أحب العمل في الهواء الطلق", type: "R" },
        { text: "أفضل الأعمال العملية على النظرية", type: "R" },
        { text: "أجد متعة في استخدام الأدوات والمعدات", type: "R" },
        { text: "أحب بناء الأشياء أو تصليحها", type: "R" },
        { text: "أستمتع بالعمل مع المواد الملموسة", type: "R" },
        { text: "أفضل المهام التي تتطلب مهارات يدوية", type: "R" },
        { text: "أحب العمل مع الآلات والمعدات الثقيلة", type: "R" },
        { text: "أستمتع بالأعمال التي تتطلب قوة بدنية", type: "R" },
        { text: "أحب العمل في البيئات الصناعية", type: "R" },
        
        // Investigative (I) Questions
        { text: "أحب حل المسائل الرياضية المعقدة", type: "I" },
        { text: "أستمتع بالبحث والاستقصاء", type: "I" },
        { text: "أحب تحليل البيانات والمعلومات", type: "I" },
        { text: "أجد متعة في التجارب العلمية", type: "I" },
        { text: "أستمتع بقراءة المجلات العلمية", type: "I" },
        { text: "أحب فهم كيفية عمل الأشياء", type: "I" },
        { text: "أستمتع بالتفكير النقدي والتحليلي", type: "I" },
        { text: "أحب دراسة الظواهر الطبيعية", type: "I" },
        { text: "أستمتع بحل الألغاز المعقدة", type: "I" },
        { text: "أحب العمل في المختبرات", type: "I" },
        
        // Artistic (A) Questions
        { text: "أستمتع بالرسم والتصوير", type: "A" },
        { text: "أحب الكتابة الإبداعية", type: "A" },
        { text: "أستمتع بالموسيقى والغناء", type: "A" },
        { text: "أحب التصميم والديكور", type: "A" },
        { text: "أستمتع بالتمثيل والمسرح", type: "A" },
        { text: "أحب ابتكار أشياء جديدة", type: "A" },
        { text: "أستمتع بالتعبير عن مشاعري بطرق فنية", type: "A" },
        { text: "أحب العمل في بيئة إبداعية حرة", type: "A" },
        { text: "أستمتع بالأعمال اليدوية الفنية", type: "A" },
        { text: "أحب حضور المعارض والفعاليات الثقافية", type: "A" },
        
        // Social (S) Questions
        { text: "أستمتع بمساعدة الآخرين في حل مشاكلهم", type: "S" },
        { text: "أحب العمل مع الأطفال", type: "S" },
        { text: "أستمتع بالعمل التطوعي", type: "S" },
        { text: "أحب تعليم الآخرين مهارات جديدة", type: "S" },
        { text: "أستمتع بالاستماع لمشاكل الناس", type: "S" },
        { text: "أحب العمل في فريق", type: "S" },
        { text: "أستمتع بتقديم المشورة للآخرين", type: "S" },
        { text: "أحب مساعدة المرضى أو كبار السن", type: "S" },
        { text: "أستمتع بتنظيم الفعاليات الاجتماعية", type: "S" },
        { text: "أحب العمل في خدمة المجتمع", type: "S" },
        
        // Enterprising (E) Questions
        { text: "أحب قيادة الآخرين", type: "E" },
        { text: "أستمتع بالتفاوض وإقناع الآخرين", type: "E" },
        { text: "أحب تحمل المسؤوليات الكبيرة", type: "E" },
        { text: "أستمتع بالمنافسة في العمل", type: "E" },
        { text: "أحب اتخاذ القرارات المهمة", type: "E" },
        { text: "أستمتع بإدارة المشاريع", type: "E" },
        { text: "أحب العمل في مجال المبيعات", type: "E" },
        { text: "أستمتع بالعمل في بيئة تنافسية", type: "E" },
        { text: "أحب تطوير استراتيجيات العمل", type: "E" },
        { text: "أستمتع بالعمل مع أشخاص طموحين", type: "E" },
        
        // Conventional (C) Questions
        { text: "أحب العمل المنظم والمرتب", type: "C" },
        { text: "أستمتع بالعمل مع الأرقام والحسابات", type: "C" },
        { text: "أحب اتباع القواعد والإجراءات", type: "C" },
        { text: "أستمتع بتنظيم الملفات والوثائق", type: "C" },
        { text: "أحب العمل في بيئة مكتبية هادئة", type: "C" },
        { text: "أستمتع بالأعمال الإدارية", type: "C" },
        { text: "أحب العمل بدقة وانتباه للتفاصيل", type: "C" },
        { text: "أستمتع بإدخال البيانات وتحليلها", type: "C" },
        { text: "أحب العمل مع جداول البيانات", type: "C" },
        { text: "أستمتع بالمهام الروتينية المنتظمة", type: "C" }
    ];
    hollandQuestions = hollandQuestions.sort(() => Math.random() - 0.5);
}

function showHollandQuestion() {
    const questionContainer = document.getElementById('hollandQuestionContainer');
    const progressFill = document.getElementById('hollandProgressFill');
    const progressText = document.getElementById('hollandProgressText');
    
    if (currentQuestionIndex >= hollandQuestions.length) {
        showHollandResults();
        return;
    }

    const question = hollandQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / hollandQuestions.length) * 100;
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `السؤال ${currentQuestionIndex + 1} من ${hollandQuestions.length}`;
    
    questionContainer.innerHTML = `
        <div class="holland-question">${question.text}</div>
        <div class="holland-options">
            <div class="holland-option" data-value="5">أوافق بشدة</div>
            <div class="holland-option" data-value="4">أوافق</div>
            <div class="holland-option" data-value="3">محايد</div>
            <div class="holland-option" data-value="2">لا أوافق</div>
            <div class="holland-option" data-value="1">لا أوافق بشدة</div>
        </div>
        <div class="holland-navigation">
            <button onclick="previousHollandQuestion()" class="btn-secondary" ${currentQuestionIndex === 0 ? 'disabled' : ''}>السابق</button>
            <button id="nextHollandBtn" class="btn-primary" disabled>${currentQuestionIndex === hollandQuestions.length - 1 ? 'عرض النتائج' : 'التالي'}</button>
        </div>
    `;

    const options = questionContainer.querySelectorAll('.holland-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            hollandAnswers[currentQuestionIndex] = { type: question.type, value: parseInt(option.dataset.value) };
            document.getElementById('nextHollandBtn').disabled = false;
        });
    });

    document.getElementById('nextHollandBtn').addEventListener('click', nextHollandQuestion);
}

function nextHollandQuestion() {
    if (hollandAnswers[currentQuestionIndex]) {
        currentQuestionIndex++;
        showHollandQuestion();
    }
}

function previousHollandQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showHollandQuestion();
    }
}

async function showHollandResults() {
    const questionContainer = document.getElementById('hollandQuestionContainer');
    const resultsContainer = document.getElementById('hollandResultsContainer');
    
    questionContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="ai-loading active">
            <div class="loading-spinner" style="width: 50px; height: 50px; border-width: 5px; border-top-color: var(--primary);"></div>
            <p class="text-xl font-bold mt-4" style="color: var(--text-dark);">جاري تحليل شخصيتك... 🤖</p>
            <p style="color: var(--text-light);">نستخدم الذكاء الاصطناعي لنقدم لك أفضل النتائج.</p>
        </div>`;

    const scores = { 'R': 0, 'I': 0, 'A': 0, 'S': 0, 'E': 0, 'C': 0 };
    hollandAnswers.forEach(answer => { scores[answer.type] += answer.value; });

    const sortedTypes = Object.entries(scores).sort(([, a], [, b]) => b - a).map(([type, score]) => ({ type, score }));
    const typeNames = { 'R': 'الواقعي', 'I': 'المفكر', 'A': 'الفني', 'S': 'الاجتماعي', 'E': 'المقدام', 'C': 'التقليدي' };
    
    const topThreeTypes = sortedTypes.slice(0, 3);
    const hollandCode = topThreeTypes.map(t => t.type).join('');

    setTimeout(() => {
        const aiAnalysis = {
            "title": `المحلل المقدام (${hollandCode})`,
            "description": "أنت شخص يجمع بين الطموح والقدرة على التحليل العميق. تستمتع بقيادة المشاريع المبنية على بيانات وحقائق، وتبرع في إيجاد حلول مبتكرة للمشاكل المعقدة. بيئة العمل المثالية لك هي التي تمنحك الاستقلالية وتكافئ المبادرة.",
            "majors": ["إدارة الأعمال", "تحليل البيانات", "هندسة صناعية", "اقتصاد", "نظم المعلومات الإدارية", "التسويق الرقمي"],
            "careers": ["محلل أعمال", "مدير منتجات", "مستشار إداري", "رائد أعمال في مجال التكنولوجيا", "مدير تسويق", "محلل مالي", "مخطط استراتيجي"],
            "tips": [
                "استثمر في تطوير مهارات التواصل لديك لتتمكن من عرض أفكارك التحليلية بفعالية.",
                "ابحث عن أدوار قيادية في المشاريع التي تتطلب دقة بيانات وحل مشكلات.",
                "لا تخف من المخاطرة المحسوبة بناءً على تحليلاتك."
            ]
        };

        resultsContainer.innerHTML = `
            <h2 class="text-3xl font-bold text-primary-dark mb-2">تحليل شخصيتك المهنية</h2>
            <p class="text-lg font-semibold text-primary mb-6">رمز هولاند الخاص بك: ${hollandCode}</p>
            <div class="p-6 rounded-2xl mb-8 text-right" style="background: rgba(79, 70, 229, 0.1);">
                <h3 class="text-2xl font-bold mb-3" style="color: var(--text-dark);">${aiAnalysis.title}</h3>
                <p class="leading-relaxed" style="color: var(--text-light);">${aiAnalysis.description}</p>
            </div>
            <div class="grid md:grid-cols-2 gap-8 text-right">
                <div>
                    <h4 class="text-xl font-bold mb-4" style="color: var(--text-dark);">💡 تخصصات جامعية مقترحة</h4>
                    <ul class="space-y-3">${aiAnalysis.majors.map(major => `<li class="flex items-start gap-3"><i class="fas fa-check-circle text-secondary mt-1"></i><span style="color: var(--text-dark);">${major}</span></li>`).join('')}</ul>
                </div>
                <div>
                    <h4 class="text-xl font-bold mb-4" style="color: var(--text-dark);">💼 وظائف مقترحة</h4>
                    <ul class="space-y-3">${aiAnalysis.careers.map(career => `<li class="flex items-start gap-3"><i class="fas fa-briefcase text-secondary mt-1"></i><span style="color: var(--text-dark);">${career}</span></li>`).join('')}</ul>
                </div>
            </div>
            <div class="mt-8 text-right">
                <h4 class="text-xl font-bold mb-4" style="color: var(--text-dark);">🚀 نصائح للنجاح</h4>
                <ul class="space-y-3">${aiAnalysis.tips.map(tip => `<li class="flex items-start gap-3 p-3 rounded-lg" style="background: var(--background);"><i class="fas fa-lightbulb text-yellow-500 mt-1"></i><span style="color: var(--text-dark);">${tip}</span></li>`).join('')}</ul>
            </div>
            <div class="mt-12 text-center">
                <p class="text-sm mb-4" style="color: var(--text-light);">هذا التحليل تم بواسطة الذكاء الاصطناعي وهو للإرشاد فقط.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="closeHollandAssessment()" class="btn-secondary">إعادة الاختبار</button>
                    <a href="#packages" onclick="closeHollandAssessment()" class="btn-primary">ناقش النتائج مع مرشد</a>
                </div>
            </div>`;
    }, 2000);
}

// Admin Modals
// mind.js

function openAdminModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeAdminModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}


// mind.js

function openAddPackageModal() {
    document.getElementById('addPackageForm').reset();
    document.getElementById('packageModalTitle').textContent = 'إضافة باقة جديدة';
    document.getElementById('packageFormSubmitBtn').textContent = 'إضافة الباقة';
    document.getElementById('editPackageId').value = '';
    
    // إفراغ حاوية المرشدين عند الإضافة
    const mentorsContainer = document.getElementById('mentors-checkbox-container');
    if (mentorsContainer) {
        mentorsContainer.innerHTML = '<p class="text-slate-400">احفظ الباقة أولاً لتتمكن من إضافة مرشدين.</p>';
    }
    
    openAdminModal('addPackageModal');
}

function openAddMentorModal() {
    document.getElementById('addMentorForm').reset();
    document.getElementById('mentorModalTitle').textContent = 'إضافة مرشد جديد';
    document.getElementById('mentorFormSubmitBtn').textContent = 'إضافة المرشد';
    document.getElementById('editMentorId').value = '';
    openAdminModal('addMentorModal');
}

function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('userModalTitle').textContent = 'إضافة مستخدم جديد';
    document.getElementById('userFormSubmitBtn').textContent = 'إضافة المستخدم';
    document.getElementById('editUserId').value = '';
    openAdminModal('addUserModal');
}

// CRUD Functions
function editUser(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');
    
    document.getElementById('userModalTitle').textContent = 'تعديل بيانات المستخدم';
    document.getElementById('userFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editUserId').value = row.dataset.id;
    
    document.getElementById('userName').value = cells[1].textContent;
    document.getElementById('userEmail').value = cells[2].textContent;
    document.getElementById('userPhone').value = cells[3].textContent;
    const statusText = cells[5].querySelector('.status-badge').textContent;
    document.getElementById('userStatus').value = statusText === 'نشط' ? 'active' : 'inactive';
    
    document.getElementById('addUserModal').classList.add('active');
}

// mind.js
function editPackage(button) {
    const card = button.closest('[data-id]');

    document.getElementById('packageModalTitle').textContent = 'تعديل بيانات الباقة';
    document.getElementById('packageFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editPackageId').value = card.dataset.id;

    // تحديث ليقرأ البيانات من الـ dataset الصحيح
    document.getElementById('packageName').value = card.dataset.title; // <-- السطر الأهم: استخدام title
    document.getElementById('packagePrice').value = card.dataset.price;
    document.getElementById('packageDescription').value = card.dataset.description;
    document.getElementById('packageStatus').value = card.dataset.status;

    document.getElementById('addPackageModal').classList.add('active');
}

function editMentor(button) {
    const card = button.closest('[data-id]');
    
    document.getElementById('mentorModalTitle').textContent = 'تعديل بيانات المرشد';
    document.getElementById('mentorFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editMentorId').value = card.dataset.id;

    document.getElementById('mentorName').value = card.dataset.name;
    document.getElementById('mentorTitle').value = card.dataset.title;
    document.getElementById('mentorAvatar').value = card.dataset.avatar;
    document.getElementById('mentorEmail').value = card.dataset.email;
    document.getElementById('mentorExperience').value = card.dataset.experience;
    document.getElementById('mentorSpecialty').value = card.dataset.specialty;
    document.getElementById('mentorStatus').value = card.dataset.status;

    openAdminModal('addMentorModal');
}

// mind.js

async function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                showNotification('تم حذف المستخدم بنجاح', 'success');
                loadAdminUsers(); // إعادة تحميل قائمة المستخدمين بعد الحذف
            } else {
                showNotification(result.message || 'فشل حذف المستخدم', 'error');
            }
        } catch (error) {
            showNotification('خطأ في الاتصال بالخادم', 'error');
        }
    }
}

function deleteRow(button) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        button.closest('[data-id]').remove();
        showNotification('تم الحذف بنجاح', 'success');
    }
}

// Login & Signup Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

// Admin Panel Functions
function openAdminPanel() {
    document.getElementById('adminPanel').classList.add('active');
    setTimeout(() => {
        document.getElementById('adminSidebar').classList.add('active');
        document.getElementById('adminContentContainer').classList.add('with-sidebar');

        loadDashboardStats(); // <--- أضف هذا السطر هنا

        initializeCharts();
    }, 10);
}

// mind.js




function closeAdminPanel() {
    document.getElementById('adminSidebar').classList.remove('active');
    document.getElementById('adminContentContainer').classList.remove('with-sidebar');
    setTimeout(() => {
        document.getElementById('adminPanel').classList.remove('active');
    }, 300);
}

function toggleAdminSidebar() {
    document.getElementById('adminSidebar').classList.toggle('active');
    document.getElementById('adminContentContainer').classList.toggle('with-sidebar');
}

function logoutAdmin() {
    closeAdminPanel();
    currentUser = null;
    showNotification('تم تسجيل الخروج بنجاح', 'info');
}

// mind.js



// mind.js

// mind.js

// ١. استبدل دالة loadAdminSessions القديمة بهذه النسخة
async function loadAdminSessions() {
    const container = document.getElementById('sessionsAdminContainer');
    if (!container) return;
    container.innerHTML = '<p class="text-center">جاري تحميل الجلسات...</p>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.sessions.length > 0) {
            container.innerHTML = '';
            result.sessions.forEach(session => {
                const statusOptions = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
                const statusDropdown = `<select class="admin-table-select" onchange="updateSessionStatus(this, '${session._id}')">
                    ${statusOptions.map(s => `<option value="${s}" ${session.status === s ? 'selected' : ''}>${getSessionStatusText(s)}</option>`).join('')}
                </select>`;

                const phone = session.userPhone || (session.user ? session.user.phone : 'غير متوفر');

                const card = document.createElement('div');
                card.className = 'border rounded-lg p-4 mb-4';
                card.style.cssText = 'background: var(--card-bg); border-color: var(--border-color);';
                card.innerHTML = `
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h5 class="font-bold" style="color: var(--text-dark);">${session.title || 'جلسة إرشادية'}</h5>
                            <p class="text-sm text-slate-400">مع: ${session.user ? session.user.name : '<em>مستخدم محذوف</em>'} (${phone})</p>
                            <p class="text-sm" style="color: var(--text-light);">المرشد: ${session.mentor ? session.mentor.name : '<em>مرشد محذوف</em>'}</p>
                        </div>
                        <span class="text-lg font-bold text-primary">${session.price || 0} ريال</span>
                    </div>
                    <div class="text-sm text-slate-400 mb-3 border-t border-b border-slate-700 py-2 my-2">
                        <span>🗓️ ${new Date(session.scheduledDate).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span class="mx-2">|</span>
                        <span>⏱️ ${session.duration || 60} دقيقة</span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-2">
                            <label class="text-sm">الحالة:</label>
                            ${statusDropdown}
                        </div>
                        <div class="flex gap-2">
                            </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="text-center">لا توجد جلسات لعرضها.</p>';
        }
    } catch (error) {
        console.error("Failed to load sessions:", error);
        container.innerHTML = '<p class="text-center text-red-500">فشل في تحميل الجلسات.</p>';
    }
}


// ٢. أضف هذا الكود الجديد إلى ملف mind.js لمعالجة نموذج إنشاء الجلسة
document.getElementById('addSessionForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const sessionId = document.getElementById('editSessionId').value;

    const sessionData = {
        sessionTitle: formData.get('sessionTitle'),
        sessionUser: formData.get('sessionUser'),
        sessionUserPhone: formData.get('sessionUserPhone'),
        sessionMentor: formData.get('sessionMentor'),
        sessionDate: formData.get('sessionDate'),
        sessionDuration: formData.get('sessionDuration'),
        sessionPrice: formData.get('sessionPrice'),
        sessionStatus: formData.get('sessionStatus'),
    };
    
    // حالياً يدعم الإنشاء فقط، يمكن إضافة منطق التعديل مستقبلاً
    const url = `${API_BASE_URL}/sessions`;
    const method = 'POST';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sessionData)
        });
        const result = await response.json();
        if (result.success) {
            showNotification(sessionId ? 'تم تحديث الجلسة' : 'تمت إضافة الجلسة بنجاح', 'success');
            closeAdminModal('addSessionModal');
            loadAdminSessions(); // إعادة تحميل قائمة الجلسات
        } else {
            showNotification(result.message || 'فشلت العملية، تأكد من ملء الحقول المطلوبة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالسيرفر', 'error');
    }
});

// دالة إضافية لتحسين تجربة المستخدم (تملأ رقم الهاتف تلقائياً)
let allAdminUsers = []; // متغير لتخزين بيانات المستخدمين
document.getElementById('sessionUser')?.addEventListener('change', (e) => {
    const selectedUserId = e.target.value;
    const phoneInput = document.getElementById('sessionUserPhone');
    const selectedUser = allAdminUsers.find(user => user._id === selectedUserId);
    if (selectedUser && selectedUser.phone) {
        phoneInput.value = selectedUser.phone;
    } else {
        phoneInput.value = '';
    }
});

// نسخة محسّنة من دالة ملء القوائم المنسدلة
async function populateSessionModalDropdowns() {
    const token = localStorage.getItem('token');
    const userSelect = document.getElementById('sessionUser');
    const mentorSelect = document.getElementById('sessionMentor');
    userSelect.innerHTML = '<option>جاري تحميل المستخدمين...</option>';
    mentorSelect.innerHTML = '<option>جاري تحميل المرشدين...</option>';

    try {
        // جلب المستخدمين
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const usersResult = await usersRes.json();
        if(usersResult.success) {
            allAdminUsers = usersResult.users; // تخزين المستخدمين
            userSelect.innerHTML = '<option value="">-- اختر مستخدم --</option>';
            userSelect.innerHTML += allAdminUsers.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
        }

        // جلب المرشدين
        const mentorsRes = await fetch(`${API_BASE_URL}/admin/mentors`, { headers: { 'Authorization': `Bearer ${token}` } });
        const mentorsResult = await mentorsRes.json();
        if(mentorsResult.success) {
            mentorSelect.innerHTML = '<option value="">-- اختر مرشد --</option>';
            mentorSelect.innerHTML += mentorsResult.mentors.map(m => `<option value="${m._id}">${m.name}</option>`).join('');
        }
    } catch (error) {
        console.error("Failed to populate dropdowns:", error);
    }
}

async function updateSessionStatus(selectElement, sessionId) {
    const newStatus = selectElement.value;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم تحديث حالة الجلسة بنجاح', 'success');
        } else {
            showNotification('فشل تحديث الحالة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// Initialize Charts
function initializeCharts() {
    const chartIds = ['revenueChart', 'monthlyRevenueChart', 'packagesChart'];
    chartIds.forEach(id => {
        let chart = Chart.getChart(id);
        if (chart) chart.destroy();
    });

    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: { 
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'], 
                datasets: [{ 
                    label: 'الإيرادات', 
                    data: [12000, 19000, 15000, 25000, 32000, 45000], 
                    borderColor: '#4f46e5', 
                    backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                    tension: 0.4, 
                    fill: true 
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const monthlyRevenueCtx = document.getElementById('monthlyRevenueChart')?.getContext('2d');
    if (monthlyRevenueCtx) {
        new Chart(monthlyRevenueCtx, {
            type: 'bar',
            data: { 
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'], 
                datasets: [{ 
                    label: 'الإيرادات الشهرية', 
                    data: [45000, 52000, 48000, 61000, 55000, 67000], 
                    backgroundColor: 'rgba(79, 70, 229, 0.8)' 
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const packagesCtx = document.getElementById('packagesChart')?.getContext('2d');
    if (packagesCtx) {
        new Chart(packagesCtx, {
            type: 'doughnut',
            data: { 
                labels: ['باقة الانطلاقة', 'جلسة استشارية', 'باقة الخريج'], 
                datasets: [{ 
                    data: [45, 89, 32], 
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b'] 
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}



// mind.js

async function loadAdminUsers(searchTerm = '') {
    try {
        // بناء الرابط مع إضافة كلمة البحث إذا كانت موجودة
        let url = `${API_BASE_URL}/admin/users`;
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url, {
            headers: {
                // إضافة التوكن للتحقق من أن المستخدم هو المدير
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const result = await response.json();

        if (result.success) {
            // استدعاء دالة العرض
            renderAdminUsers(result.users);
        } else {
            document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="8" class="text-center">فشل في تحميل المستخدمين</td></tr>';
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="8" class="text-center">خطأ في الاتصال بالخادم</td></tr>';
    }
}

function renderAdminUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد نتائج تطابق بحثك</td></tr>';
        return;
    }

    tbody.innerHTML = users.map((user, index) => `
        <tr data-id="${user._id}">
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'غير متوفر'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString('ar-SA')}</td>
            <td><span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">${user.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
            <td>${user.orders.length}</td>
            <td>
                <button class="btn-secondary" onclick="editUser(this)">تعديل</button>
                <button class="btn-danger" onclick="deleteUser('${user._id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

// Purchase Page Functions - FIXED VERSION
function openPurchasePage(packageData) {
    if (!currentUser) {
        showNotification('يرجى تسجيل الدخول أولاً', 'error');
        openLoginModal();
        return;
    }

    // تأكد من استخدام المعرف الصحيح من قاعدة البيانات
    selectedPackage = {
        ...packageData,
        id: packageData._id || packageData.id || packageData.packageId
    };
    
    document.getElementById('purchasePage').classList.add('active');
    
    document.getElementById('selectedPackageInfo').innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h3 class="font-bold text-lg" style="color: var(--text-dark);">${packageData.title || packageData.name}</h3>
                <p style="color: var(--text-light);">مع المرشد: ${selectedMentor?.name || 'سيتم تحديده لاحقاً'}</p>
            </div>
            <div class="text-left">
                <p class="text-2xl font-bold text-primary">${packageData.price} ريال</p>
            </div>
        </div>`;
    
    document.getElementById('totalPrice').textContent = `${packageData.price} ريال`;
    
    // Pre-fill user data
    if (currentUser) {
        document.getElementById('fullName').value = currentUser.name;
        document.getElementById('email').value = currentUser.email;
        document.getElementById('phone').value = currentUser.phone || '';
    }
}

function closePurchasePage() {
    document.getElementById('purchasePage').classList.remove('active');
    selectedPackage = null;
    selectedMentor = null;
}


// Debug function للمساعدة في التشخيص
window.debugOrderData = function() {
    console.log('=== Debug Order Data ===');
    console.log('Selected Package:', selectedPackage);
    console.log('Selected Mentor:', selectedMentor);
    console.log('Current User:', currentUser);
    console.log('Payment Method:', document.querySelector('.payment-method.selected'));
    console.log('Token:', localStorage.getItem('token'));
    console.log('API Base URL:', API_BASE_URL);
};

function initializeRestOfFunctionality() {
    // Admin Form Handlers
    document.getElementById('addUserForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const editId = document.getElementById('editUserId').value;

        if (editId) {
            const row = document.querySelector(`#usersTableBody tr[data-id="${editId}"]`);
            row.cells[1].textContent = formData.get('userName');
            row.cells[2].textContent = formData.get('userEmail');
            row.cells[3].textContent = formData.get('userPhone');
            const status = formData.get('userStatus');
            row.cells[5].innerHTML = `<span class="status-badge ${status === 'active' ? 'status-active' : 'status-inactive'}">${status === 'active' ? 'نشط' : 'غير نشط'}</span>`;
            showNotification('تم تحديث بيانات المستخدم', 'info');
        } else {
            const tbody = document.getElementById('usersTableBody');
            const newId = 'user' + (tbody.rows.length + 1);
            const newRow = tbody.insertRow();
            newRow.dataset.id = newId;
            const status = formData.get('userStatus');
            newRow.innerHTML = `
                <td>${tbody.rows.length}</td>
                <td>${formData.get('userName')}</td>
                <td>${formData.get('userEmail')}</td>
                <td>${formData.get('userPhone')}</td>
                <td>${new Date().toISOString().split('T')[0]}</td>
                <td><span class="status-badge ${status === 'active' ? 'status-active' : 'status-inactive'}">${status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>0</td>
                <td>
                    <button class="btn-secondary" onclick="editUser(this)">تعديل</button>
                    <button class="btn-danger" onclick="deleteUser('${newId}')">حذف</button>
                </td>`;
            showNotification('تم إضافة المستخدم بنجاح', 'success');
        }
        closeAdminModal('addUserModal');
    });

    // mind.js




// mind.js

// mind.js

// mind.js

document.getElementById('addPackageForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const mentorCheckboxes = document.querySelectorAll('#mentors-checkbox-container input[name="mentors"]:checked');
    const selectedMentorIds = Array.from(mentorCheckboxes).map(cb => cb.value);

    const formData = new FormData(this);
    const packageId = document.getElementById('editPackageId').value;

    const packageData = {
        name: formData.get('packageName'),
        price: formData.get('packagePrice'),
        description: formData.get('packageDescription'),
        status: formData.get('packageStatus'),
        mentors: selectedMentorIds
    };

    let url = `${API_BASE_URL}/admin/packages`;
    let method = 'POST';
    if (packageId) {
        url = `${API_BASE_URL}/admin/packages/${packageId}`;
        method = 'PUT';
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(packageData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification(packageId ? 'تم تحديث الباقة بنجاح' : 'تمت إضافة الباقة بنجاح', 'success');
            closeAdminModal('addPackageModal');
            loadAdminPackages(); // 1. تحديث عرض الباقات داخل لوحة التحكم

            // --- ✅✅✅ السطر الأهم الذي يحل المشكلة نهائياً ✅✅✅ ---
            // يقوم بإعادة تحميل بيانات الباقات للصفحة الرئيسية بالكامل مع بيانات المرشدين المحدثة
            loadPackages();     
            // ---------------------------------------------------------

        } else {
            showNotification(result.message || 'فشلت العملية', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالسيرفر', 'error');
    }
});


    
    document.getElementById('addMentorForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const mentorId = document.getElementById('editMentorId').value;
    
    const mentorData = {
        mentorName: formData.get('mentorName'),
        mentorTitle: formData.get('mentorTitle'),
        mentorAvatar: formData.get('mentorAvatar'),
        mentorEmail: formData.get('mentorEmail'),
        mentorExperience: formData.get('mentorExperience'),
        mentorBio: formData.get('mentorBio'),
        mentorSpecialty: formData.get('mentorSpecialty'),
        mentorStatus: formData.get('mentorStatus'),
    };

    let url = `${API_BASE_URL}/admin/mentors`;
    let method = 'POST';

    if (mentorId) {
        url = `${API_BASE_URL}/admin/mentors/${mentorId}`;
        method = 'PUT';
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(mentorData)
        });
        const result = await response.json();
        if (result.success) {
            showNotification(mentorId ? 'تم تحديث المرشد بنجاح' : 'تمت إضافة المرشد بنجاح', 'success');
            closeAdminModal('addMentorModal');
            loadAdminMentors();
        } else {
            // هذا السطر مهم لإظهار أي خطأ من السيرفر
            showNotification(result.message || 'فشلت العملية، تأكد من إدخال كل الحقول', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالسيرفر', 'error');
    }
});

    // Admin Navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(this.dataset.section);
        });
    });

    // Reveal on Scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Animated Counter
    const achievementObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('[data-target]');
                counters.forEach(counter => {
                    if (counter.dataset.animated) return;
                    counter.dataset.animated = true;
                    const target = +counter.getAttribute('data-target');
                    let current = 0;
                    const increment = target / 100;
                    const updateCount = () => {
                        if (current < target) {
                            current += increment;
                            counter.innerText = Math.ceil(current).toLocaleString('ar-EG');
                            requestAnimationFrame(updateCount);
                        } else {
                            counter.innerText = target.toLocaleString('ar-EG');
                        }
                    };
                    updateCount();
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    const achievementsSection = document.getElementById('achievements');
    if (achievementsSection) achievementObserver.observe(achievementsSection);

    // Tabs Logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === button.dataset.tab) content.classList.add('active');
            });
        });
    });

    // Mentors Data and Rendering
    
    // Testimonials Logic
    const testimonials = [
        { quote: "انا مبسوط اني تكلمت مع فريق مسار ومن بعد الله الحمدلله بمجرد كلمة خلوني اخذ القرار الصح، الله يسعدكم يارب.", avatar: "س" },
        { quote: "تجربة فريدة ومميزة! ساعدتني الجلسة في تحديد أهدافي الأكاديمية بوضوح وثقة.", avatar: "أ" },
        { quote: "الآن لدي خطة واضحة لمستقبلي المهني، كل الشكر لمنصة مسار على الدعم والإرشاد المتميز.", avatar: "ن" },
        { quote: "كنت محتارة في اختيار التخصص الجامعي، لكن بفضل مسار استطعت تحديد شغفي الحقيقي. شكراً جزيلاً!", avatar: "م" },
        { quote: "الإرشاد الذي حصلت عليه ساعدني في تحسين سيرتي الذاتية والحصول على وظيفة أحلامي. فريق احترافي ومتميز.", avatar: "ر" },
        { quote: "مسار غيّرت حياتي! من طالب ثانوي حائر إلى طالب جامعي واثق من نفسه. الله يجزاهم خير.", avatar: "ع" },
        { quote: "الدعم النفسي والمهني الذي تلقيته من مسار كان له تأثير كبير في حياتي. الآن أنا في أفضل مسار لي.", avatar: "ل" },
        { quote: "صراحة الجلسات الإرشادية ممتازة والمرشدين عندهم خبرة وفهم عميق. أنصح كل طالب يستفيد من خدماتهم.", avatar: "ف" }
    ];
    const stackContainer = document.getElementById('testimonial-stack');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    let currentIndex = 0;
    let testimonialInterval;

    function renderTestimonials() {
        if (!stackContainer) return;
        stackContainer.innerHTML = '';
        dotsContainer.innerHTML = '';
        testimonials.forEach((t, index) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `<p class="text-lg md:text-xl font-medium" style="color: var(--text-dark);">"${t.quote}"</p><div class="testimonial-avatar">${t.avatar}</div>`;
            stackContainer.appendChild(card);
            const dot = document.createElement('button');
            dot.className = 'w-3 h-3 rounded-full transition-all duration-300';
            dot.style.background = 'var(--text-light)';
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        });
        updateCardPositions();
    }

    function updateCardPositions() {
        const cards = stackContainer.querySelectorAll('.testimonial-card');
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next', 'hidden-card', 'testimonial-card-gradient');
            let newIndex = index - currentIndex;
            if (newIndex < 0) newIndex += testimonials.length;
            if (newIndex === 0) card.classList.add('active', 'testimonial-card-gradient');
            else if (newIndex === 1) card.classList.add('next');
            else if (newIndex === testimonials.length - 1) card.classList.add('prev');
            else card.classList.add('hidden-card');
        });
        const dots = dotsContainer.querySelectorAll('button');
        dots.forEach((dot, index) => {
            dot.style.background = index === currentIndex ? 'var(--primary)' : 'var(--text-light)';
        });
    }

    function cycleTestimonials(direction) {
        if (direction === 'next') currentIndex = (currentIndex + 1) % testimonials.length;
        else currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateCardPositions();
    }

    function startAutoplay() { testimonialInterval = setInterval(() => cycleTestimonials('next'), 5000); }
    function stopAutoplay() { clearInterval(testimonialInterval); }

    if(stackContainer){
        renderTestimonials();
        startAutoplay();
        [stackContainer, prevBtn, nextBtn, dotsContainer].forEach(el => {
            el.addEventListener('mouseenter', stopAutoplay);
            el.addEventListener('mouseleave', startAutoplay);
        });
        prevBtn.addEventListener('click', () => cycleTestimonials('prev'));
        nextBtn.addEventListener('click', () => cycleTestimonials('next'));
        dotsContainer.addEventListener('click', (e) => {
            if(e.target.tagName === 'BUTTON') {
                currentIndex = parseInt(e.target.dataset.index);
                updateCardPositions();
            }
        });
    }


    const supplementaryPackageData = {
        'باقة الانطلاقة': { 
            video: 'https://www.youtube.com/embed/L_LUpnjgPso', 
            services: ['جلسة استكشافية شاملة (60 دقيقة)', 'تقرير مفصل للتخصصات المناسبة', 'خطة دراسية مخصصة لسنوات الثانوية', 'دليل الجامعات والكليات المناسبة', 'متابعة لمدة شهر كامل عبر WhatsApp'], 
            mentorKeys: ['afnan', 'lulu', 'noura'] 
        },
        'جلسة استشارية': { 
            video: 'https://www.youtube.com/embed/L_LUpnjgPso', 
            services: ['60 دقيقة تركيز كامل مع المرشد', 'مراجعة وتحسين السيرة الذاتية', 'استشارة فورية لأي مشكلة مهنية', 'خطة عمل قصيرة المدى', 'تسجيل الجلسة للمراجعة لاحقاً'], 
            mentorKeys: ['mohaned', 'afnan', 'lulu'] 
        },
        'باقة الخريج': { 
            video: 'https://www.youtube.com/embed/L_LUpnjgPso', 
            services: ['إعداد سيرة ذاتية احترافية مميزة', 'تطوير ملف LinkedIn متكامل', 'تدريب مكثف على المقابلات الوظيفية', 'استراتيجية البحث عن عمل', 'متابعة لمدة 3 أشهر حتى الحصول على وظيفة'], 
            mentorKeys: ['mohaned', 'noura', 'afnan'] 
        }
    };

    const mentorKeyMap = {
        'afnan': 'أفنان الشهراني',
        'lulu': 'ابتسام الحربي',
        'mohaned': 'Mohamed Alghamdi',
        'noura': 'نورة الدخيل'
    };

    window.showPackageDetails = function(packageObject) {
        selectedPackage = packageObject; // Set the globally selected package
        
        console.log('showPackageDetails called with:', packageObject);
        console.log('openMultiStepForm available?', typeof openMultiStepForm);
        
        // فتح النموذج متعدد الخطوات مباشرة
        if (typeof openMultiStepForm === 'function') {
            try {
                openMultiStepForm();
            } catch (error) {
                console.error('Error opening multi-step form:', error);
                showNotification('حدث خطأ في فتح النموذج', 'error');
            }
        } else {
            console.log('Using old method');
            // إذا لم يكن النموذج متعدد الخطوات متوفراً، استخدم الطريقة القديمة
            const gridView = document.getElementById('packages-grid-view');
            const detailedView = document.getElementById('packages-detailed-view');
            gridView.classList.replace('view-visible', 'view-hidden');
            detailedView.classList.replace('view-hidden', 'view-visible');
            
            renderPackageSelectors(packageObject._id);
            showSelectedPackageDetails(packageObject);
            showPackageMentors(packageObject);
        }
    }


    








// mind.js

// mind.js

// ✅✅✅ تأكد من أن هذا الكود الصحيح موجود في ملف mind.js ✅✅✅


// دوال مساعدة لترجمة الحالات



// دالة تحديث الحالات



// دوال مساعدة لترجمة الحالات



// ========================================================================
// ✅✅✅  الكود الصحيح والنهائي لإدارة الطلبات في لوحة التحكم ✅✅✅
// ========================================================================

// ========================================================================
// ✅✅✅  الكود الصحيح والنهائي لإدارة الطلبات في لوحة التحكم ✅✅✅
// ========================================================================








// ========================================================================
// نهاية الكود الصحيح
// ========================================================================
// دوال تحديث الحالات

// mind.js

// --- كود إدارة الطلبات ---
// ✅✅✅ MAKE SURE THIS CORRECT CODE REMAINS ✅✅✅


// ابحث عن هذه الدالة واستبدلها بالكامل








// mind.js

// دالة لفتح نافذة إضافة جلسة
async function openAddSessionModal() {
    document.getElementById('addSessionForm').reset();
    document.getElementById('sessionModalTitle').textContent = 'إضافة جلسة جديدة';
    document.getElementById('sessionFormSubmitBtn').textContent = 'إضافة الجلسة';
    document.getElementById('editSessionId').value = '';

    // جلب المستخدمين والمرشدين لملء القوائم المنسدلة
    await populateSessionModalDropdowns();
    openAdminModal('addSessionModal');
}

// دالة لفتح نافذة تعديل جلسة
async function openEditSessionModal(sessionId) {
    document.getElementById('addSessionForm').reset();
    document.getElementById('sessionModalTitle').textContent = 'تعديل بيانات الجلسة';
    document.getElementById('sessionFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editSessionId').value = sessionId;
    
    // أولاً، جلب المستخدمين والمرشدين
    await populateSessionModalDropdowns();

    // ثانياً، جلب بيانات الجلسة المحددة
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await response.json();
        if(result.success) {
            const session = result.session;
            document.getElementById('sessionUser').value = session.user._id;
            document.getElementById('sessionMentor').value = session.mentor._id;
            // تنسيق التاريخ ليتوافق مع حقل datetime-local
            const date = new Date(session.scheduledDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            document.getElementById('sessionDate').value = date.toISOString().slice(0,16);
            document.getElementById('sessionStatus').value = session.status;
        }
    } catch(error) { console.error("Failed to fetch session details:", error); }

    openAdminModal('addSessionModal');
}

// دالة مساعدة لملء قوائم المستخدمين والمرشدين
async function populateSessionModalDropdowns() {
    const token = localStorage.getItem('token');
    const userSelect = document.getElementById('sessionUser');
    const mentorSelect = document.getElementById('sessionMentor');
    userSelect.innerHTML = '<option>جاري التحميل...</option>';
    mentorSelect.innerHTML = '<option>جاري التحميل...</option>';

    // جلب المستخدمين
    const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
    const usersResult = await usersRes.json();
    if(usersResult.success) {
        userSelect.innerHTML = usersResult.users.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
    }

    // جلب المرشدين
    const mentorsRes = await fetch(`${API_BASE_URL}/admin/mentors`, { headers: { 'Authorization': `Bearer ${token}` } });
    const mentorsResult = await mentorsRes.json();
    if(mentorsResult.success) {
        mentorSelect.innerHTML = mentorsResult.mentors.map(m => `<option value="${m._id}">${m.name}</option>`).join('');
    }
}

// تعديل دالة عرض الجلسات لإضافة زر التعديل


// --- كود إدارة الجلسات ---
async function loadAdminSessions() {
    const container = document.getElementById('sessionsAdminContainer');
    container.innerHTML = '<p class="text-center">جاري تحميل الجلسات...</p>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.sessions.length > 0) {
            container.innerHTML = '';
            result.sessions.forEach(session => {
                const statusOptions = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
                const statusDropdown = `<select class="admin-table-select" onchange="updateSessionStatus(this, '${session._id}')">
                    ${statusOptions.map(s => `<option value="${s}" ${session.status === s ? 'selected' : ''}>${getSessionStatusText(s)}</option>`).join('')}
                </select>`;

                const card = document.createElement('div');
                card.className = 'border rounded-lg p-4 mb-4';
                card.style.borderColor = 'var(--border-color)';
                card.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <h5 class="font-bold" style="color: var(--text-dark);">جلسة مع: ${session.user ? session.user.name : '<em>محذوف</em>'}</h5>
                        <span class="text-sm text-gray-400">${new Date(session.scheduledDate).toLocaleString('ar-SA')}</span>
                    </div>
                    <p class="text-sm mb-2" style="color: var(--text-light);">المرشد: ${session.mentor ? session.mentor.name : '<em>محذوف</em>'}</p>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <label class="text-sm">الحالة:</label>
                            ${statusDropdown}
                        </div>
                        <div class="flex gap-2">
                            <button class="btn-secondary" onclick="editSession('${session._id}')">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="btn-primary" onclick="openSessionMeeting('${session._id}')">
                                <i class="fas fa-video"></i> فتح الجلسة
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="text-center">لا توجد جلسات لعرضها.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-red-500">فشل في تحميل الجلسات.</p>';
    }
}


function getSessionStatusText(status) {
    const statusMap = {
        'scheduled': 'مجدولة',
        'in_progress': 'جارية',
        'completed': 'مكتملة',
        'cancelled': 'ملغية',
        'no_show': 'لم يحضر'
    };
    return statusMap[status] || status;
}


async function updateSessionStatus(selectElement, sessionId) {
    const newStatus = selectElement.value;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم تحديث حالة الجلسة بنجاح', 'success');
        } else {
            showNotification('فشل تحديث الحالة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

function editSession(sessionId) {
    // فتح نموذج تعديل الجلسة
    openAdminModal('addSessionModal');
    document.getElementById('editSessionId').value = sessionId;
    // هنا يمكنك إضافة المزيد من المنطق لتحميل بيانات الجلسة في النموذج
}

function openSessionMeeting(sessionId) {
    // هنا يمكنك إضافة المنطق لفتح رابط الجلسة
    // مثلاً: window.open(`${API_BASE_URL}/sessions/${sessionId}/join`, '_blank');
    showNotification('جاري فتح الجلسة...', 'info');
}


// --- تحديث دالة التنقل ---
// ابحث عن دالة showSection واستبدلها بالكامل بهذه النسخة
// mind.js
// mind.js

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => section.style.display = 'none');
    document.getElementById(`admin-${sectionName}`).style.display = 'block';
    
    document.querySelectorAll('.admin-nav-item').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    activeNav.classList.add('active');

    document.getElementById('admin-section-title').textContent = activeNav.querySelector('span').textContent;

    if (sectionName === 'dashboard') loadDashboardStats(); 
    if (sectionName === 'users') loadAdminUsers();
    if (sectionName === 'packages') loadAdminPackages();
    if (sectionName === 'mentors') loadAdminMentors();
    if (sectionName === 'orders') loadAdminOrders();
    if (sectionName === 'sessions') loadAdminSessions(); 
    
    // ✅ --- تأكد 100% من وجود هذا السطر --- ✅
    if (sectionName === 'cv-requests') loadAdminCvRequests();

    if (window.innerWidth < 768) {
        toggleAdminSidebar();
    }
}



function renderAdminOrders(orders) {
    const container = document.getElementById('admin-orders-table-body');
    container.innerHTML = orders.map(order => `
        <tr>
            <td>${order._id}</td>
            <td>${order.user?.name || '-'}</td>
            <td>${order.package?.name || '-'}</td>
            <td>${order.mentor?.name || '-'}</td>
            <td>${order.totalAmount} ريال</td>
            <td>${order.status}</td>
            <td>
                <button onclick="updateOrderStatus('${order._id}', 'completed')">جعل مكتمل</button>
            </td>
        </tr>
    `).join('');
}

function renderAdminSessions(sessions) {
    const container = document.getElementById('admin-sessions-table-body');
    container.innerHTML = sessions.map(session => `
        <tr>
            <td>${session._id}</td>
            <td>${session.user?.name || '-'}</td>
            <td>${session.package?.name || '-'}</td>
            <td>${session.mentor?.name || '-'}</td>
            <td>${session.scheduledDate}</td>
            <td>${session.status}</td>
            <td>
                <button onclick="updateSessionStatus('${session._id}', 'completed')">جعل مكتملة</button>
            </td>
        </tr>
    `).join('');
}

    function renderPackageSelectors(selectedId) {
    const container = document.getElementById('package-list-container');
    if (!container) return;
    container.innerHTML = allPackagesData.map(pkg => `
        <div class="mobile-package-selector ${pkg._id === selectedId ? 'active' : ''}" data-package-id="${pkg._id}">
            <div class="flex items-center justify-between">
                <div><h4 class="font-bold text-lg" style="color: var(--text-dark);">${pkg.name}</h4></div>
                <div class="text-right"><p class="text-xl font-bold text-primary">${pkg.price}</p><p class="text-xs" style="color: var(--text-light);">ريال</p></div>
            </div>
        </div>`).join('');
    
    container.querySelectorAll('.mobile-package-selector').forEach(selector => {
        selector.addEventListener('click', () => {
            const packageId = selector.dataset.packageId;
            const newSelectedPkg = allPackagesData.find(p => p._id === packageId);
            if (newSelectedPkg) {
                showPackageDetails(newSelectedPkg);
            }
        });
    });
}


    function showSelectedPackageDetails(pkg) {
    if (!pkg) return;
    const container = document.getElementById('package-details-container');
    if (!container) return;
    const extraData = supplementaryPackageData[pkg.name] || { video: 'https://www.youtube.com/embed/L_LUpnjgPso', services: pkg.description.split(/،|,/) };
    
    container.innerHTML = `
        <div class="mobile-video-container"><iframe src="${extraData.video}" allowfullscreen></iframe></div>
        <h2>${pkg.name}</h2>
        <div class="price-section">
            <div><span class="price">${pkg.price}</span><span class="text-lg font-medium mr-2" style="color: var(--text-light);">ريال</span></div>
            <button class="btn-gradient" onclick="proceedToPurchase()">احجز الآن</button>
        </div>
        <div class="description">${pkg.description}</div>
        <div class="mobile-service-list">
            <h3>ما تشمله الباقة:</h3>
            <ul>${extraData.services.map(service => `<li>${service.trim()}</li>`).join('')}</ul>
        </div>`;
}

    function showPackageMentors(pkg) {
    if (!pkg) return;
    const container = document.getElementById('mentor-list-container');
    if (!container) return;
    const availableMentors = pkg.mentors || [];
    if (availableMentors.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-400">لا يوجد مرشدون مخصصون لهذه الباقة حاليًا.</p>';
        return;
    }
    container.innerHTML = availableMentors.map(mentor => {
        return `
            <div class="mobile-mentor-card" data-mentor-db-id="${mentor._id}">
                <div class="mobile-mentor-header">
                    <img src="${mentor.avatar || 'https://placehold.co/80x80/e0e7ff/4338ca'}" alt="${mentor.name}" class="mobile-mentor-avatar">
                    <div class="mobile-mentor-info flex-grow"><h4>${mentor.name}</h4><p>${mentor.title || 'مرشد معتمد'}</p></div>
                    <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <div class="mobile-mentor-body">
                    <p style="color: var(--text-light);">${mentor.bio || 'مرشد متخصص في مسارك'}</p>
                    <button class="btn-primary mt-3 w-full" onclick="selectMentor('${mentor._id}')">اختر هذا المرشد</button>
                </div>
            </div>`;
    }).join('');
    container.querySelectorAll('.mobile-mentor-card').forEach(card => {
        card.querySelector('.mobile-mentor-header').addEventListener('click', () => {
            card.classList.toggle('open');
        });
    });
}

    window.selectMentor = function(mentorDbId) {
        const apiMentorData = allMentorsData.find(m => m._id === mentorDbId);
        if (!apiMentorData) {
            console.error('API mentor data not found for id:', mentorDbId);
            return;
        }
        selectedMentor = apiMentorData;
        showNotification(`تم اختيار ${selectedMentor.name} كمرشدك`, 'success');
        
        document.querySelectorAll('.mobile-mentor-card').forEach(card => card.classList.remove('selected'));
        document.querySelector(`[data-mentor-db-id="${mentorDbId}"]`)?.classList.add('selected');
    };

    window.proceedToPurchase = function() {
        if (!selectedPackage) {
            showNotification('الرجاء اختيار باقة أولاً', 'error');
            return;
        }
        if (!selectedMentor) {
            showNotification('يرجى اختيار مرشد أولاً', 'error');
            return;
        }
        openPurchasePage(selectedPackage);
    };

    // Back to Grid Logic
    document.getElementById('back-to-grid-button')?.addEventListener('click', () => {
        const gridView = document.getElementById('packages-grid-view');
        const detailedView = document.getElementById('packages-detailed-view');
        detailedView.classList.replace('view-visible', 'view-hidden');
        gridView.classList.replace('view-hidden', 'view-visible');
    });

    document.getElementById('mobile-back-button')?.addEventListener('click', (e) => {
        e.preventDefault();
        const gridView = document.getElementById('packages-grid-view');
        const detailedView = document.getElementById('packages-detailed-view');
        detailedView.classList.replace('view-visible', 'view-hidden');
        gridView.classList.replace('view-hidden', 'view-visible');
    });


    }




    // mind.js

// دالة لجلب وعرض المرشدين في لوحة التحكم
// mind.js

async function loadAdminMentors() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            const mentorsGrid = document.getElementById('mentorsGridAdmin');
            mentorsGrid.innerHTML = '';
            result.mentors.forEach(mentor => {
                const card = document.createElement('div');
                card.className = 'border rounded-lg p-6 text-center shadow-lg';
                card.style.cssText = 'background: var(--card-bg); border-color: var(--border-color);';
                
                card.dataset.id = mentor._id;
                card.dataset.name = mentor.name;
                card.dataset.title = mentor.title;
                card.dataset.avatar = mentor.avatar;
                card.dataset.email = mentor.email;
                card.dataset.experience = mentor.experience; // <-- التصحيح هنا
                card.dataset.specialty = mentor.specialty;
                card.dataset.status = mentor.status;

                card.innerHTML = `
                    <img src="${mentor.avatar || 'https://placehold.co/80x80/e0e7ff/4338ca'}" alt="مرشد" class="w-20 h-20 rounded-full mx-auto mb-4 object-cover" style="border: 3px solid var(--border-color);">
                    <h4 class="font-bold text-lg" style="color: var(--text-dark);">${mentor.name}</h4>
                    <p class="text-sm mb-2" style="color: var(--text-light);">${mentor.title}</p>
                    <p class="text-xs mb-4" style="color: var(--text-light);">عدد الجلسات: ${mentor.sessions?.length || 0}</p>
                    <span class="status-badge ${mentor.status === 'active' ? 'status-active' : 'status-inactive'} mb-4">${mentor.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    <div class="flex gap-2 mt-3 justify-center">
                        <button class="btn-secondary" onclick="editMentor(this)">تعديل</button>
                        <button class="btn-danger" onclick="deleteMentor('${mentor._id}')">حذف</button>
                    </div>
                `;
                mentorsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load mentors:', error);
    }
}

// دالة لفتح نافذة التعديل مع تعبئة البيانات
function editMentor(button) {
    const card = button.closest('[data-id]');

    document.getElementById('mentorModalTitle').textContent = 'تعديل بيانات المرشد';
    document.getElementById('mentorFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editMentorId').value = card.dataset.id;

    // تعبئة النموذج من البيانات المخزنة في العنصر
    document.getElementById('mentorName').value = card.dataset.name;
    document.getElementById('mentorTitle').value = card.dataset.title;
    document.getElementById('mentorEmail').value = card.dataset.email;
    document.getElementById('mentorExperience').value = card.dataset.experience;
    document.getElementById('mentorSpecialty').value = card.dataset.specialty;
    document.getElementById('mentorStatus').value = card.dataset.status;

    openAdminModal('addMentorModal');
}

// دالة لحذف مرشد
async function deleteMentor(mentorId) {
    if (confirm('هل أنت متأكد من حذف هذا المرشد؟')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/mentors/${mentorId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                showNotification('تم حذف المرشد بنجاح', 'success');
                loadAdminMentors(); // إعادة تحميل القائمة بعد الحذف
            } else {
                showNotification(result.message || 'فشل الحذف', 'error');
            }
        } catch (error) {
            showNotification('خطأ في الاتصال بالسيرفر', 'error');
        }
    }
}




// mind.js

// معالجة نموذج إضافة وتعديل المرشدين
document.getElementById('addMentorForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const mentorId = document.getElementById('editMentorId').value;

    const mentorData = {
        mentorName: formData.get('mentorName'),
        mentorTitle: formData.get('mentorTitle'),
        mentorEmail: formData.get('mentorEmail'),
        mentorExperience: formData.get('mentorExperience'),
        mentorSpecialty: formData.get('mentorSpecialty'),
        mentorStatus: formData.get('mentorStatus'),
    };

    let url = `${API_BASE_URL}/admin/mentors`;
    let method = 'POST';

    if (mentorId) {
        url = `${API_BASE_URL}/admin/mentors/${mentorId}`;
        method = 'PUT';
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(mentorData)
        });
        const result = await response.json();
        if (result.success) {
            showNotification(mentorId ? 'تم تحديث المرشد بنجاح' : 'تمت إضافة المرشد بنجاح', 'success');
            closeAdminModal('addMentorModal');
            loadAdminMentors(); // تحديث القائمة بعد الإضافة أو التعديل
        } else {
            showNotification(result.message || 'فشلت العملية', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالسيرفر', 'error');
    }
});

    // mind.js - Add this new function

function renderPublicPackages(packages) {
    const container = document.getElementById('public-packages-grid');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    const packageConfig = {
        'باقة الانطلاقة': { order: 1, icon: '<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>' },
        'جلسة استشارية': { order: 2, featured: true, icon: '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>' },
        'باقة الخريج': { order: 3, icon: '<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>' }
    };

    const sortedPackages = packages.sort((a, b) => {
        const orderA = packageConfig[a.title]?.order || 99;
        const orderB = packageConfig[b.title]?.order || 99;
        return orderA - orderB;
    });

    sortedPackages.forEach(pkg => {
        const config = packageConfig[pkg.title] || {};
        const isFeatured = config.featured;
        const cardClass = isFeatured ? 'mobile-package-card featured' : 'mobile-package-card';
        const priceClass = isFeatured ? 'text-white' : 'text-indigo-600';
        const subtitleColor = isFeatured ? 'text-white/80' : 'text-light';
        const featureColor = isFeatured ? 'text-white' : 'text-dark';
        const buttonClass = isFeatured ? 'mobile-package-button secondary' : 'mobile-package-button primary';
        
        const features = (pkg.description || '').split(/،|,/).slice(0, 3).map(f => `<div class="mobile-package-feature"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span style="color: var(--${featureColor});">${f.trim()}</span></div>`).join('');

        const cardHTML = `
            <div class="${cardClass}">
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-12 h-12 ${isFeatured ? 'bg-white/20' : 'bg-indigo-100'} rounded-xl flex items-center justify-center">
                            ${config.icon || ''}
                        </div>
                        <div>
                            <h3 class="text-xl md:text-2xl font-bold" style="color: var(--${isFeatured ? 'white' : 'text-dark'});">${pkg.title}</h3>
                            <p class="text-sm" style="color: var(--${subtitleColor});">${(pkg.description || '').split(/،|,/)[0]}</p>
                        </div>
                    </div>
                    <div class="mb-6">
                    <span class="mobile-package-price ${priceClass}">${pkg.price}</span>
                    <span class="text-lg font-medium mr-2" style="color: var(--${subtitleColor});">دينار أردني</span>
                    </div>
                    <div class="space-y-3 mb-8">
                        ${features}
                    </div>
                    <button data-package-id-public="${pkg._id}" class="${buttonClass} public-show-details-button">
                        اختر واعرض التفاصيل
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });

    document.querySelectorAll('.public-show-details-button').forEach(button => {
        button.addEventListener('click', () => {
            const packageId = button.dataset.packageIdPublic;
            const selectedPkg = allPackagesData.find(p => p._id === packageId);
            if(selectedPkg) {
                showPackageDetails(selectedPkg); 
            }
        });
    });
}


    // mind.js - PASTE THIS ENTIRE BLOCK

// 1. DYNAMICALLY LOADS PACKAGES FROM THE DATABASE
// mind.js

// mind.js

async function loadAdminPackages() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/packages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            const packagesGrid = document.getElementById('packagesGrid');
            packagesGrid.innerHTML = ''; 
            result.packages.forEach(pkg => {
                const card = document.createElement('div');
                card.className = 'border rounded-lg p-6 shadow-lg';
                card.style.cssText = 'background: var(--card-bg); border-color: var(--border-color);';
                card.dataset.id = pkg._id;

                // --- التصحيح هنا: توحيد استخدام .name لكل البيانات ---
                card.dataset.name = pkg.name; 
                card.dataset.price = pkg.price;
                card.dataset.description = pkg.description;
                card.dataset.status = pkg.status;

                card.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-lg" style="color: var(--text-dark);">${pkg.name}</h4>
                        <span class="status-badge ${pkg.status === 'active' ? 'status-active' : 'status-inactive'}">${pkg.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </div>
                    <p class="mb-2" style="color: var(--text-light);">${pkg.price} دينار أردني</p>
                    <p class="text-sm mb-4" style="color: var(--text-light);">${pkg.description || 'لا يوجد وصف'}</p>
                    <div class="flex gap-2">
                        <button class="btn-secondary flex-1" onclick="openPackageEditModal(this)">تعديل</button>
                        <button class="btn-danger" onclick="deletePackage('${pkg._id}')">حذف</button>
                    </div>
                `;
                packagesGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load packages:', error);
    }
}

// 2. OPENS THE MODAL AND FILLS IT WITH THE CORRECT DATA FOR EDITING
// mind.js

// احذف دالة editPackage القديمة وضع هذه بدلاً منها
// mind.js

// دالة فتح نافذة التعديل (نسخة محدثة وصحيحة)
// mind.js

// mind.js

async function openPackageEditModal(button) {
    const card = button.closest('[data-id]');
    const packageId = card.dataset.id;

    document.getElementById('packageModalTitle').textContent = 'تعديل بيانات الباقة';
    document.getElementById('packageFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editPackageId').value = packageId;

    // --- التصحيح هنا: استخدام card.dataset.name لملء الحقل ---
    document.getElementById('packageName').value = card.dataset.name;
    document.getElementById('packagePrice').value = card.dataset.price;
    document.getElementById('packageDescription').value = card.dataset.description;
    document.getElementById('packageStatus').value = card.dataset.status;

    const mentorsContainer = document.getElementById('mentors-checkbox-container');
    mentorsContainer.innerHTML = 'جاري تحميل المرشدين...';
    
    openAdminModal('addPackageModal');

    try {
        const token = localStorage.getItem('token');
        // جلب كل المرشدين المتاحين
        const mentorsRes = await fetch(`${API_BASE_URL}/admin/mentors`, { headers: { 'Authorization': `Bearer ${token}` } });
        const mentorsResult = await mentorsRes.json();

        // جلب الباقة الحالية لمعرفة المرشدين المرتبطين بها
        const packageRes = await fetch(`${API_BASE_URL}/packages/${packageId}`);
        const packageResult = await packageRes.json();
        const assignedMentorIds = packageResult.package.mentors.map(m => m._id);

        if (mentorsResult.success) {
            mentorsContainer.innerHTML = ''; 
            mentorsResult.mentors.forEach(mentor => {
                const isChecked = assignedMentorIds.includes(mentor._id) ? 'checked' : '';
                const checkboxHTML = `<label class="flex items-center gap-2 p-2 rounded hover:bg-slate-700"><input type="checkbox" name="mentors" value="${mentor._id}" class="form-checkbox" ${isChecked}><span>${mentor.name}</span></label>`;
                mentorsContainer.innerHTML += checkboxHTML;
            });
        } else {
            mentorsContainer.innerHTML = 'فشل في تحميل المرشدين';
        }
    } catch (error) {
        mentorsContainer.innerHTML = 'خطأ في الاتصال بالخادم';
    }
}


// كود حفظ التعديلات (نسخة محدثة وصحيحة)


// 3. HANDLES BOTH CREATING AND UPDATING A PACKAGE VIA API


// 4. DELETES A PACKAGE VIA API
async function deletePackage(packageId) {
    if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/packages/${packageId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                showNotification('تم الحذف بنجاح', 'success');
                loadAdminPackages(); // Refresh the list after deleting
            } else {
                showNotification(result.message || 'فشل الحذف', 'error');
            }
        } catch (error) {
            showNotification('خطأ في الاتصال بالسيرفر', 'error');
        }
    }
}

    // mind.js

window.proceedToPurchase = function(packageId) {
    // Get the static package data (which has info like video URL, mentor list, etc.)
    const staticPkgData = packagesData[packageId];
    if (!staticPkgData) {
        console.error("Package details not found in static data for ID:", packageId);
        showNotification('حدث خطأ غير متوقع', 'error');
        return;
    }

    // Find the corresponding package from the data loaded from the API.
    // This object contains the correct database _id.
    const apiPkgData = allPackagesData.find(p => p.title === staticPkgData.title);
    if (!apiPkgData) {
        console.error("Package details not found in API data for title:", staticPkgData.title);
        showNotification('عذراً، حدث خطأ في تحميل بيانات الباقة.', 'error');
        return;
    }

    // Merge the two objects to have all necessary information.
    // The key is that this new object includes the database _id from apiPkgData.
    const fullPackageData = { ...staticPkgData, ...apiPkgData };

    if (!selectedMentor) {
        showNotification('يرجى اختيار مرشد أولاً', 'error');
        return;
    }

    // Proceed to the purchase page with the complete, correct package data.
    openPurchasePage(fullPackageData);
};


// إضافة هذه الدالة في mind.js
// استبدل دالة updatePublicPackages القديمة بهذه النسخة المحدثة
function updatePublicPackages(packages) {
    const packagesContainer = document.querySelector('#packages-grid-view .grid.grid-cols-1.md\\:grid-cols-3.max-w-6xl');
    if (!packagesContainer) { return; }
    packagesContainer.innerHTML = '';

    const packageSettings = {
        // --- الإضافة الجديدة: إعدادات الباقة الذهبية ---
        'الباقة الذهبية': { 
            order: 0, // ستظهر أولاً
            golden: true, // علامة خاصة للتعرف عليها
            subtitle: '10 دقائق مجانية مع مرشد', 
            icon: `<svg class="w-6 h-6 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`, 
            features: ['جلسة تعريفية سريعة', 'طرح سؤال واحد مهم', 'لا تتطلب أي دفع'] 
        },
        'باقة الانطلاقة': { order: 2, featured: false, subtitle: 'مثالية لطلاب الثانوية', icon: `<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`, features: ['جلسة استكشافية شاملة', 'تقرير مفصل للتخصصات', 'خطة دراسية مخصصة'] },
        'جلسة استشارية': { order: 1, featured: true, subtitle: 'ساعة تركيز كاملة', icon: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`, features: ['60 دقيقة تركيز كامل', 'مراجعة سيرة ذاتية', 'استشارة فورية'] },
        'باقة الخريج': { order: 3, featured: false, subtitle: 'للانطلاق في سوق العمل', icon: `<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`, features: ['إعداد سيرة ذاتية احترافية', 'تحضير للمقابلات', 'تطوير ملف LinkedIn'] }
    };

    const sortedPackages = packages.sort((a, b) => {
        const orderA = packageSettings[a.name]?.order ?? 99;
        const orderB = packageSettings[b.name]?.order ?? 99;
        return orderA - orderB;
    });

    sortedPackages.forEach(pkg => {
        // --- التعديل هنا: اسم الباقة الآن .name بدلاً من .title ---
        const settings = packageSettings[pkg.name] || { subtitle: pkg.description.split(/،|,/)[0], icon: packageSettings['باقة الانطلاقة'].icon, features: pkg.description.split(/،|,/).slice(0, 3) };
        const isFeatured = settings.featured;
        const isGolden = settings.golden; // <-- متغير جديد للتحقق من الباقة الذهبية

        let packageCard = document.createElement('div');
        
        // --- التعديل هنا: تطبيق كلاس التصميم الذهبي ---
        let cardClass = 'mobile-package-card';
        if (isFeatured) {
            cardClass += ' featured';
        } else if (isGolden) {
            cardClass += ' golden-package';
        }
        packageCard.className = cardClass;
        
        // --- تم تحديث pkg.title إلى pkg.name في كل مكان ---
        packageCard.innerHTML = `
            <div class="p-6 md:p-8">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 ${isFeatured ? 'bg-white/20' : 'bg-indigo-100'} rounded-xl flex items-center justify-center">${settings.icon}</div>
                    <div>
                        <h3 class="text-xl md:text-2xl font-bold" style="color: ${isFeatured ? 'white' : 'var(--text-dark)'};">${pkg.name}</h3>
                        <p class="text-sm" style="color: ${isFeatured ? 'rgba(255,255,255,0.8)' : 'var(--text-light)'};">${settings.subtitle}</p>
                    </div>
                </div>
                <div class="mb-6">
                    <span class="mobile-package-price ${isFeatured ? 'text-white' : 'text-indigo-600'}">${pkg.price}</span>
                    <span class="text-lg font-medium mr-2" style="color: ${isFeatured ? 'rgba(255,255,255,0.8)' : 'var(--text-light)'};">دينار أردني</span>
                </div>
                <div class="space-y-3 mb-8">
                    ${settings.features.map(feature => `<div class="mobile-package-feature"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><span style="color: ${isFeatured ? 'white' : 'var(--text-dark)'};">${feature.trim()}</span></div>`).join('')}
                </div>
                <button data-package-id="${pkg._id}" class="mobile-package-button ${isFeatured ? 'secondary' : 'primary'} show-details-button">اختر واعرض التفاصيل</button>
            </div>`;
        packagesContainer.appendChild(packageCard);
    });

    packagesContainer.querySelectorAll('.show-details-button').forEach(button => {
        button.addEventListener('click', () => {
            const packageId = button.dataset.packageId;
            const selectedPkg = packages.find(p => p._id === packageId);
            if (selectedPkg) {
                showPackageDetails(selectedPkg);
            }
        });
    });
}


 







    // mind.js

window.selectMentor = function(mentorId) {
    // mentorId هو الاسم النصي مثل 'lulu' أو 'afnan'
    const staticMentorData = mentorsData[mentorId];
    if (!staticMentorData) {
        console.error('Static mentor data not found for:', mentorId);
        showNotification('حدث خطأ في اختيار المرشد', 'error');
        return;
    }

    // ابحث عن بيانات المرشد الكاملة في القائمة القادمة من السيرفر (allMentorsData)
    // باستخدام الاسم للمطابقة
    const apiMentorData = allMentorsData.find(m => m.name === staticMentorData.name);

    if (!apiMentorData) {
        showNotification('عذراً، حدث خطأ في تحميل بيانات المرشد.', 'error');
        console.error('API mentor data not found for name:', staticMentorData.name);
        return;
    }

    // الآن، قم بتعيين المرشد المختار مع استخدام الـ _id الصحيح من قاعدة البيانات
    selectedMentor = {
        ...apiMentorData,
        id: apiMentorData._id //  <-- هذا هو السطر الأهم
    };
    
    showNotification(`تم اختيار ${selectedMentor.name} كمرشدك`, 'success');
    
    document.querySelectorAll('.mobile-mentor-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-mentor-id="${mentorId}"]`)?.classList.add('selected');
};

    // Show Details Button Logic
    document.querySelectorAll('.show-details-button').forEach(button => {
        button.addEventListener('click', () => {
            const packageId = button.dataset.packageId;
            showPackageDetails(packageId);
        });
    });


    

    // Back to Grid Logic
    document.getElementById('back-to-grid-button')?.addEventListener('click', () => {
        const gridView = document.getElementById('packages-grid-view');
        const detailedView = document.getElementById('packages-detailed-view');
        detailedView.classList.replace('view-visible', 'view-hidden');
        gridView.classList.replace('view-hidden', 'view-visible');
    });

    document.getElementById('mobile-back-button')?.addEventListener('click', (e) => {
        e.preventDefault();
        const gridView = document.getElementById('packages-grid-view');
        const detailedView = document.getElementById('packages-detailed-view');
        detailedView.classList.replace('view-visible', 'view-hidden');
        gridView.classList.replace('view-hidden', 'view-visible');
    });


    


// mind.js

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`); // طلب الإحصائيات
        const result = await response.json();

        if (result.success) {
            const stats = result.stats.overview;
            // تحديث الأرقام في لوحة التحكم
            document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-number').textContent = stats.totalUsers.toLocaleString('ar-EG');
            document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-number').textContent = stats.totalOrders.toLocaleString('ar-EG');
            document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-number').textContent = stats.totalSessions.toLocaleString('ar-EG');
            document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-number').textContent = stats.totalMentors.toLocaleString('ar-EG');
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Add CSS for new elements
const additionalCSS = `
    .session-filter-btn {
        padding: 8px 16px;
        border: 1px solid var(--border-color);
        background: var(--card-bg);
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .session-filter-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }

    .session-status-badge {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
    }

    .status-upcoming {
        background: rgba(59, 130, 246, 0.1);
        color: rgb(59, 130, 246);
    }

    .status-completed {
        background: rgba(16, 185, 129, 0.1);
        color: rgb(16, 185, 129);
    }

    .status-cancelled {
        background: rgba(239, 68, 68, 0.1);
        color: rgb(239, 68, 68);
    }

    .status-in-progress {
        background: rgba(245, 158, 11, 0.1);
        color: rgb(245, 158, 11);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        background: #10b981;
    }

    .notification.error {
        background: #ef4444;
    }

    .notification.info {
        background: #3b82f6;
    }
`;

// Add the CSS to the page
const styleElement = document.createElement('style');
styleElement.textContent = additionalCSS;
document.head.appendChild(styleElement);







// mind.js

// --- START: Predefined Tree Plans Logic ---

// 1. Data for the predefined plans
// --- START: New Hierarchical Tree Plans Data ---

// --- START: Expanded Hierarchical Tree Plans Data ---

const careerFieldsData = {
    'it': {
        name: 'تقنية المعلومات',
        icon: 'fa-laptop-code',
        specializations: {
            'software-dev': {
                name: 'تطوير البرمجيات',
                icon: 'fa-code',
                subSpecializations: {
                    'fullstack-web': {
                        name: 'تطوير الويب الكامل (Full-Stack)',
                        description: 'مسار شامل لتصبح مطور ويب محترف، من الواجهات الأمامية إلى الخلفية.',
                        plan: {
                            title: 'خطة تطوير الويب الكامل',
                            levels: [
                                { name: 'المستوى الأول: أساسيات الويب', courses: ['HTML5', 'CSS3', 'أساسيات JavaScript (ES6+)'] },
                                { name: 'المستوى الثاني: تطوير الواجهات الأمامية', courses: ['React.js أو Vue.js', 'Tailwind CSS', 'State Management (Redux/Pinia)'] },
                                { name: 'المستوى الثالث: تطوير الواجهات الخلفية', courses: ['Node.js & Express', 'MongoDB أو PostgreSQL', 'Authentication (JWT) & Security'] },
                                { name: 'المستوى الرابع: الاحتراف والنشر', courses: ['Docker', 'CI/CD (GitHub Actions)', 'Git & GitHub المتقدم'] }
                            ]
                        }
                    },
                    'mobile-dev': {
                        name: 'تطوير تطبيقات الجوال',
                        description: 'تعلم بناء تطبيقات تعمل على أنظمة Android و iOS باستخدام أحدث التقنيات.',
                        plan: {
                            title: 'خطة تطوير تطبيقات الجوال',
                            levels: [
                                { name: 'المستوى الأول: اختيار التقنية والأساسيات', courses: ['لغة Dart (لـ Flutter) أو Kotlin (لـ Android)', 'أساسيات UI/UX للموبايل'] },
                                { name: 'المستوى الثاني: بناء الواجهات المتقدمة', courses: ['Flutter Widgets أو Jetpack Compose', 'إدارة الحالة (State Management - BLoC/Provider)'] },
                                { name: 'المستوى الثالث: التعامل مع البيانات والشبكات', courses: ['REST APIs & Retrofit/Dio', 'قواعد بيانات محلية (SQLite/Realm)'] },
                                { name: 'المستوى الرابع: النشر والتحسين', courses: ['النشر على Google Play و App Store', 'تحسين أداء التطبيق (Profiling)', 'Firebase Integration'] }
                            ]
                        }
                    },
                    'game-dev': {
                        name: 'تطوير الألعاب',
                        description: 'ادخل عالم صناعة الألعاب بتعلم محركات الألعاب الشهيرة مثل Unity أو Unreal.',
                        plan: {
                            title: 'خطة تطوير الألعاب',
                            levels: [
                                { name: 'المستوى الأول: أساسيات تطوير الألعاب', courses: ['لغة C# (لـ Unity) أو C++ (لـ Unreal)', 'مبادئ تصميم الألعاب (Game Design)'] },
                                { name: 'المستوى الثاني: تعلم محرك الألعاب', courses: ['أساسيات Unity أو Unreal Engine', 'الفيزياء والتحريك (Animation)'] },
                                { name: 'المستوى الثالث: برمجة ميكانيكيات اللعب', courses: ['برمجة حركة اللاعب', 'الذكاء الاصطناعي للأعداء (AI)', 'تصميم المراحل (Level Design)'] },
                                { name: 'المستوى الرابع: التحسين والنشر', courses: ['تحسين أداء اللعبة (Optimization)', 'نشر اللعبة على منصات مختلفة (PC/Mobile)'] }
                            ]
                        }
                    }
                }
            },
            'data-science': {
                name: 'علم البيانات والذكاء الاصطناعي',
                icon: 'fa-brain',
                subSpecializations: {
                    'machine-learning': {
                        name: 'مهندس تعلم الآلة',
                        description: 'تخصص في بناء وتدريب نماذج الذكاء الاصطناعي لحل المشاكل المعقدة.',
                        plan: {
                            title: 'خطة مهندس تعلم الآلة',
                            levels: [
                                { name: 'المستوى الأول: الرياضيات والبرمجة', courses: ['Python للبيانات', 'الجبر الخطي والتفاضل والتكامل', 'الإحصاء والاحتمالات'] },
                                { name: 'المستوى الثاني: تحليل ومعالجة البيانات', courses: ['Pandas & NumPy', 'Matplotlib & Seaborn', 'تنظيف وهندسة الميزات'] },
                                { name: 'المستوى الثالث: نماذج تعلم الآلة', courses: ['Scikit-Learn', 'خوارزميات الانحدار، التصنيف، والتجميع', 'تقييم النماذج'] },
                                { name: 'المستوى الرابع: التعلم العميق ونشر النماذج', courses: ['TensorFlow أو PyTorch', 'الشبكات العصبية (ANN, CNN, RNN)', 'MLOps & Deployment'] }
                            ]
                        }
                    },
                    'data-analyst': {
                        name: 'محلل البيانات',
                        description: 'تعلم كيفية استخلاص رؤى قيمة من البيانات وعرضها بشكل فعال.',
                        plan: {
                            title: 'خطة محلل البيانات',
                            levels: [
                                { name: 'المستوى الأول: أساسيات قواعد البيانات', courses: ['SQL المتقدم', 'Excel للاحترافيين'] },
                                { name: 'المستوى الثاني: أدوات عرض البيانات', courses: ['Tableau أو Power BI', 'تصميم لوحات المعلومات (Dashboards)'] },
                                { name: 'المستوى الثالث: تحليل البيانات برمجياً', courses: ['Python (Pandas)', 'سرد القصص بالبيانات (Data Storytelling)'] }
                            ]
                        }
                    }
                }
            },
            'cyber-security': {
                name: 'الأمن السيبراني',
                icon: 'fa-shield-alt',
                subSpecializations: {
                    'ethical-hacking': {
                        name: 'الاختراق الأخلاقي',
                        description: 'تعلم تقنيات الاختراق للدفاع عن الأنظمة وتأمينها من الهجمات.',
                        plan: {
                             title: 'خطة الاختراق الأخلاقي',
                            levels: [
                                { name: 'المستوى الأول: أساسيات الشبكات والأنظمة', courses: ['Network+ Concepts', 'Linux/Windows Administration', 'Security+ Concepts'] },
                                { name: 'المستوى الثاني: تقنيات الاختراق الأساسية', courses: ['Footprinting & Reconnaissance', 'Scanning Networks', 'Enumeration'] },
                                { name: 'المستوى الثالث: اختراق التطبيقات والأنظمة', courses: ['System Hacking', 'Web Application Hacking (OWASP Top 10)', 'Wireless Hacking'] },
                                { name: 'المستوى الرابع: كتابة التقارير والشهادات', courses: ['Penetration Testing Reporting', 'التحضير لشهادة CEH أو OSCP'] }
                            ]
                        }
                    }
                }
            }
        }
    },
    'business': {
        name: 'الأعمال والتسويق',
        icon: 'fa-briefcase',
        specializations: {
            'digital-marketing': {
                name: 'التسويق الرقمي',
                icon: 'fa-bullhorn',
                subSpecializations: {
                    'seo-specialist': {
                        name: 'أخصائي تحسين محركات البحث (SEO)',
                        description: 'تخصص في جعل المواقع تتصدر نتائج البحث على جوجل.',
                        plan: {
                            title: 'خطة أخصائي SEO',
                            levels: [
                                { name: 'المستوى الأول: أساسيات SEO', courses: ['كيف تعمل محركات البحث', 'SEO التقني (Technical SEO)', 'بحث الكلمات المفتاحية'] },
                                { name: 'المستوى الثاني: SEO داخل وخارج الصفحة', courses: ['On-Page SEO', 'بناء الروابط الخلفية (Link Building)', 'تسويق المحتوى'] },
                                { name: 'المستوى الثالث: التحليل والأدوات المتقدمة', courses: ['Google Analytics 4', 'Google Search Console', 'أدوات مثل Ahrefs/Semrush'] }
                            ]
                        }
                    },
                    'social-media-marketing': {
                        name: 'التسويق عبر التواصل الاجتماعي',
                        description: 'إدارة الحملات الإعلانية والمحتوى على منصات التواصل الاجتماعي.',
                        plan: {
                            title: 'خطة التسويق عبر التواصل الاجتماعي',
                            levels: [
                                { name: 'المستوى الأول: الاستراتيجية والمحتوى', courses: ['بناء استراتيجية تسويق', 'كتابة المحتوى الإعلاني', 'تصميم الجرافيك الأساسي (Canva)'] },
                                { name: 'المستوى الثاني: إدارة الحملات الإعلانية', courses: ['إعلانات Meta (Facebook & Instagram)', 'إعلانات TikTok', 'إعلانات LinkedIn'] },
                                { name: 'المستوى الثالث: التحليل وإدارة المجتمع', courses: ['تحليل أداء الحملات', 'أدوات إدارة حسابات التواصل', 'خدمة العملاء عبر المنصات'] }
                            ]
                        }
                    }
                }
            }
        }
    },
    'design': {
        name: 'التصميم والإبداع',
        icon: 'fa-palette',
        specializations: {
            'graphic-design': {
                name: 'التصميم الجرافيكي',
                icon: 'fa-swatchbook',
                subSpecializations: {
                    'branding-identity': {
                        name: 'تصميم الهويات التجارية',
                        description: 'تخصص في بناء الهوية البصرية الكاملة للشركات والعلامات التجارية.',
                        plan: {
                            title: 'خطة تصميم الهويات التجارية',
                            levels: [
                                { name: 'المستوى الأول: مبادئ التصميم', courses: ['نظرية الألوان', 'الطباعة (Typography)', 'أساسيات التكوين البصري'] },
                                { name: 'المستوى الثاني: أدوات التصميم', courses: ['Adobe Illustrator (للشعارات)', 'Adobe Photoshop (للمعالجة)', 'Adobe InDesign (للمطبوعات)'] },
                                { name: 'المستوى الثالث: بناء الهوية', courses: ['تصميم الشعارات', 'بناء دليل الهوية البصرية (Brand Guide)', 'تصميم المطبوعات التجارية'] }
                            ]
                        }
                    }
                }
            },
            'ui-ux': {
                name: 'تصميم واجهة وتجربة المستخدم',
                icon: 'fa-mobile-alt',
                subSpecializations: {
                    'ux-researcher': {
                        name: 'باحث تجربة المستخدم (UX Researcher)',
                        description: 'تخصص في فهم سلوك المستخدمين واحتياجاتهم لبناء منتجات أفضل.',
                        plan: {
                            title: 'خطة باحث تجربة المستخدم',
                             levels: [
                                { name: 'المستوى الأول: أساسيات بحث المستخدم', courses: ['مقدمة في تجربة المستخدم', 'طرق البحث النوعي والكمي'] },
                                { name: 'المستوى الثاني: تقنيات البحث', courses: ['مقابلات المستخدمين', 'الاستبيانات', 'بناء شخصيات المستخدم (Personas)'] },
                                { name: 'المستوى الثالث: اختبار قابلية الاستخدام', courses: ['Usability Testing', 'تحليل النتائج وتقديم التوصيات', 'أدوات مثل Maze'] }
                            ]
                        }
                    }
                }
            }
        }
    },
    'engineering': {
        name: 'الهندسة',
        icon: 'fa-cogs',
        specializations: {
            'robotics-automation': {
                name: 'الروبوتات والأتمتة',
                icon: 'fa-robot',
                subSpecializations: {
                    'plc-automation': {
                        name: 'أتمتة المصانع (PLC)',
                        description: 'تعلم برمجة وحدات التحكم المنطقية القابلة للبرمجة (PLC) للتحكم في العمليات الصناعية.',
                         plan: {
                            title: 'خطة أتمتة المصانع (PLC)',
                            levels: [
                                { name: 'المستوى الأول: أساسيات الكهرباء والتحكم', courses: ['الدوائر الكهربائية', 'التحكم الكلاسيكي', 'قراءة المخططات الكهربائية'] },
                                { name: 'المستوى الثاني: برمجة PLC', courses: ['مقدمة في PLC (Siemens/Allen-Bradley)', 'لغة Ladder Logic', 'Timers & Counters'] },
                                { name: 'المستوى الثالث: الأنظمة المتقدمة', courses: ['شاشات HMI', 'شبكات صناعية (Profinet)', 'أنظمة SCADA'] }
                            ]
                        }
                    }
                }
            }
        }
    }
};

// --- END: Expanded Hierarchical Tree Plans Data ---

// --- END: New Hierarchical Tree Plans Data ---

// 2. Function to render plan cards based on category
// --- START: New Dynamic Tree Plans Logic ---

// 1. Function to render navigation cards (Fields, Specializations, etc.)
function renderTreeNavigation(path = []) {
    const container = document.getElementById('tree-navigation-container');
    container.innerHTML = '';
    updateBreadcrumbs(path);

    let currentLevelData = careerFieldsData;
    path.forEach(key => {
        currentLevelData = currentLevelData[key]?.specializations || currentLevelData[key]?.subSpecializations;
    });

    if (!currentLevelData) {
        container.innerHTML = `<p class="text-center col-span-full text-slate-400">لا توجد بيانات لهذا القسم.</p>`;
        return;
    }

    Object.keys(currentLevelData).forEach(key => {
        const item = currentLevelData[key];
        const card = document.createElement('div');
        card.className = 'plan-card';
        card.innerHTML = `
            <div class="plan-card-icon"><i class="fas ${item.icon}"></i></div>
            <h4>${item.name}</h4>
            ${item.description ? `<p>${item.description}</p>` : ''}
        `;

        card.onclick = () => {
            const newPath = [...path, key];
            // If the next level is a plan, display it. Otherwise, render the next level of navigation.
            if (item.plan) {
                displayTreePlan(item.plan);
            } else {
                renderTreeNavigation(newPath);
            }
        };
        container.appendChild(card);
    });
}

// 2. Function to update the breadcrumbs navigation
function updateBreadcrumbs(path) {
    const breadcrumbsContainer = document.getElementById('tree-plan-breadcrumbs');
    breadcrumbsContainer.innerHTML = '';

    // Home link
    const homeLink = document.createElement('a');
    homeLink.href = '#';
    homeLink.textContent = 'المجالات الرئيسية';
    homeLink.className = 'breadcrumb-item';
    homeLink.onclick = (e) => {
        e.preventDefault();
        renderTreeNavigation([]);
    };
    breadcrumbsContainer.appendChild(homeLink);

    let currentLevelData = careerFieldsData;
    path.forEach((key, index) => {
        const item = currentLevelData[key];
        if (!item) return;

        // Add separator
        const separator = document.createElement('span');
        separator.textContent = '>';
        separator.className = 'text-slate-500';
        breadcrumbsContainer.appendChild(separator);

        const pathLink = document.createElement('a');
        pathLink.href = '#';
        pathLink.textContent = item.name;
        pathLink.className = 'breadcrumb-item';

        const currentPath = path.slice(0, index + 1);
        pathLink.onclick = (e) => {
            e.preventDefault();
            renderTreeNavigation(currentPath);
        };
        breadcrumbsContainer.appendChild(pathLink);

        currentLevelData = item.specializations || item.subSpecializations;
    });
}

// 3. Function to display the final tree plan (You already have this, just ensure it's here)
function displayTreePlan(plan) {
    const resultContainer = document.getElementById('treeResultContainer');
    document.getElementById('aiLoadingSection').classList.remove('active');

    // Hide navigation and AI sections
    document.getElementById('tree-navigation-container').style.display = 'none';
    document.getElementById('tree-plan-breadcrumbs').style.display = 'none';
    document.querySelector('.custom-ai-section').style.display = 'none';
    document.querySelector('.separator-text').style.display = 'none';

    let planHTML = `<div class="learning-path">`;
    plan.levels.forEach((level, index) => {
        planHTML += `
            <div class="path-level">
                <div class="level-header">${level.name}</div>
                <div class="courses-grid">
                    ${level.courses.map(course => `
                        <div class="course-card">
                            <h4 class="course-title">${course}</h4>
                            <p class="course-description">دورة مقترحة لتعلم هذه المهارة.</p>
                        </div>
                    `).join('')}
                </div>
                ${index < plan.levels.length - 1 ? '<div class="level-connector"></div>' : ''}
            </div>`;
    });
    planHTML += `</div>`;

    resultContainer.innerHTML = planHTML;
    resultContainer.classList.add('visible');

    // Add a "Back" button
    const backButton = document.createElement('button');
    backButton.textContent = 'العودة للاختيار';
    backButton.className = 'btn-secondary mt-8 mx-auto block';
    backButton.onclick = resetTreePlanView;
    resultContainer.prepend(backButton);
}

// 4. Function to reset the view to the main categories
function resetTreePlanView() {
    document.getElementById('treeResultContainer').innerHTML = '';
    document.getElementById('treeResultContainer').classList.remove('visible');

    // Show navigation and AI sections again
    document.getElementById('tree-navigation-container').style.display = 'grid';
    document.getElementById('tree-plan-breadcrumbs').style.display = 'flex';
    document.querySelector('.custom-ai-section').style.display = 'block';
    document.querySelector('.separator-text').style.display = 'flex';

    // Render the top-level fields
    renderTreeNavigation([]);
}

// 5. Modify openTreePlan to initialize the new view
function openTreePlan() {
    document.getElementById('treePlanPage').classList.add('active');
    resetTreePlanView(); // This will now reset to the main fields view
}
// --- END: New Dynamic Tree Plans Logic ---





 /* ======================================== */
/* START: AI Interview Coach Logic          */
/* ======================================== */

// متغيرات لتخزين حالة المقابلة
let currentCoachQuestionIndex = 0;
let userJobTitle = "";
let interviewQuestions = [];

const placeholderQuestions = {
    "default": [
        "أخبرني عن نفسك.",
        "ما هي نقاط قوتك؟",
        "ما هي نقاط ضعفك؟",
        "لماذا ترغب في العمل معنا؟",
        "أين ترى نفسك بعد 5 سنوات؟"
    ],
    "مطور": [
        "أخبرني عن مشروع تفتخر به.",
        "اشرح مفهوم (Asynchronous JavaScript) لمدير غير تقني.",
        "ما هي خبرتك مع Git و version control؟",
        "كيف تتعامل مع النقد على الكود الخاص بك في (Code Review)؟",
        "لماذا اخترت أن تكون مطوراً؟"
    ]
};

// --- 1. فتح وإغلاق النافذة ---

function openInterviewCoach() {
    document.getElementById('interviewCoachPage').classList.add('active');
    // إعادة تعيين الحالة عند كل مرة يفتح فيها المدرب
    resetCoach();
}

function closeInterviewCoach() {
    document.getElementById('interviewCoachPage').classList.remove('active');
}

// --- 2. إعادة تعيين المدرب للحالة الأولية ---

function resetCoach() {
    currentCoachQuestionIndex = 0;
    userJobTitle = "";
    interviewQuestions = [];
    
    // إظهار خطوة الإعداد وإخفاء الخطوات الأخرى
    document.getElementById('coach-setup-step').style.display = 'block';
    document.getElementById('coach-interview-step').style.display = 'none';
    document.getElementById('coach-report-step').style.display = 'none';
    
    // إفراغ الحقول
    document.getElementById('jobTitleInput').value = "";
    document.getElementById('coach-user-answer').value = "";
    document.getElementById('coach-feedback-box').style.display = 'none';
}

// --- 3. بدء جلسة المقابلة ---

function startInterviewSession() {
    userJobTitle = document.getElementById('jobTitleInput').value.toLowerCase();
    
    // (محاكاة) اختيار الأسئلة بناءً على المسمى الوظيفي
    if (userJobTitle.includes("مطور") || userJobTitle.includes("developer")) {
        interviewQuestions = placeholderQuestions["مطور"];
    } else {
        interviewQuestions = placeholderQuestions["default"];
    }
    
    // إخفاء الإعداد وإظهار شاشة المقابلة
    document.getElementById('coach-setup-step').style.display = 'none';
    document.getElementById('coach-interview-step').style.display = 'block';
    
    // تحميل السؤال الأول
    loadNextCoachQuestion();
}

// --- 4. إرسال الإجابة والحصول على تحليل ---

function submitCoachAnswer() {
    const answer = document.getElementById('coach-user-answer').value;
    const feedbackBox = document.getElementById('coach-feedback-box');
    const feedbackContent = document.getElementById('coach-feedback-content');
    const submitBtn = document.getElementById('coach-submit-answer');
    const nextBtn = document.getElementById('coach-next-question');

    if (answer.trim() === "") {
        showNotification("يرجى كتابة إجابتك أولاً", "error");
        return;
    }

    // تعطيل الأزرار وإظهار التحميل
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري تحليل الإجابة... 🤖";
    feedbackBox.style.display = 'block';
    feedbackContent.innerHTML = '<div class="loading-spinner mx-auto"></div>';
    nextBtn.style.display = 'none';

    // (محاكاة) انتظار رد الذكاء الاصطناعي
    setTimeout(() => {
        // (محاكاة) هذا هو الرد الذي سيأتي من API
        let simulatedFeedback = "إجابة جيدة. <br><br><strong>للتطوير:</strong> حاول استخدام <strong>(STAR Method)</strong> - اذكر الموقف (Situation)، المهمة (Task)، الإجراء (Action)، والنتيجة (Result) لجعل إجابتك أقوى.";
        
        feedbackContent.innerHTML = simulatedFeedback;
        submitBtn.style.display = 'none'; // إخفاء زر الإرسال
        nextBtn.style.display = 'block'; // إظهار زر السؤال التالي
    }, 2000); // 2 ثانية محاكاة
}

// --- 5. تحميل السؤال التالي أو إنهاء المقابلة ---

function loadNextCoachQuestion() {
    currentCoachQuestionIndex++;
    
    if (currentCoachQuestionIndex < interviewQuestions.length) {
        // لا يزال هناك أسئلة
        const question = interviewQuestions[currentCoachQuestionIndex];
        
        // تحديث واجهة المستخدم
        document.getElementById('questionCounter').textContent = `السؤال ${currentCoachQuestionIndex + 1} من ${interviewQuestions.length}`;
        document.getElementById('coach-question-text').textContent = question;
        
        // إخفاء التحليل وإعادة تفعيل زر الإرسال
        document.getElementById('coach-feedback-box').style.display = 'none';
        document.getElementById('coach-user-answer').value = "";
        
        const submitBtn = document.getElementById('coach-submit-answer');
        submitBtn.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = "أرسل الإجابة";
        
        document.getElementById('coach-next-question').style.display = 'none';

    } else {
        // انتهت الأسئلة، اعرض التقرير
        showInterviewReport();
    }
}

// --- 6. عرض التقرير النهائي ---

function showInterviewReport() {
    document.getElementById('coach-interview-step').style.display = 'none';
    document.getElementById('coach-report-step').style.display = 'block';
}

/* ======================================== */
/* END: AI Interview Coach Logic            */
/* ======================================== */


// Free CV Session Functions
function openFreeCVModal() {
    document.getElementById('freeCVModal').classList.add('active');
}

function closeFreeCVModal() {
    document.getElementById('freeCVModal').classList.remove('active');
}




// ============================================
// وظائف قسم السيرة الذاتية المجانية
// ============================================

// فتح النموذج
// استبدل هذه الدالة في mind.js
function openCVBookingModal() {
    window.location.href = 'cv-booking.html';
}

// إغلاق النموذج
function closeCVBookingModal() {
    document.getElementById('cvBookingModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// إغلاق عند الضغط على Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCVBookingModal();
    }
});

// عرض الإشعارات
function showCVNotification(message, type = 'success') {
    const notification = document.getElementById('cvNotification');
    notification.textContent = message;
    notification.className = `cv-notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ================================
// وظائف قسم السيرة الذاتية المجانية
// ================================

// فتح مودال / صفحة حجز السيرة الذاتية (لو محتاجة)
function openCVBookingModal() {
    const modal = document.getElementById('cvBookingModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// إغلاق المودال
function closeCVBookingModal() {
    const modal = document.getElementById('cvBookingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// إشعار خاص بقسم الـ CV
function showCVNotification(message, type = 'success') {
    const notification = document.getElementById('cvNotification');
    if (!notification) {
        alert(message);
        return;
    }

    notification.textContent = message;
    notification.className = `cv-notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// التعامل مع إرسال نموذج حجز السيرة الذاتية


// فتح نموذج حجز السيرة الذاتية من زر الباقة
function openCvBookingForPackage(packageName, packagePrice) {
    console.log('📦 openCvBookingForPackage:', packageName, packagePrice);

    // نبحث عن المودال أولاً
    const modal =
        document.getElementById('freeCVModal') ||
        document.getElementById('cvModal') ||
        document.getElementById('cvBookingModal');

    if (!modal) {
        console.error('⚠️ لم يتم العثور على مودال السيرة الذاتية');
        alert('خطأ: لم يتم العثور على نموذج الحجز');
        return;
    }

    // نختار الفورم (سواء freeCVForm أو cvBookingForm حسب الصفحة)
    const cvForm =
        document.getElementById('freeCVForm') ||
        document.getElementById('cvBookingForm');

    if (!cvForm) {
        console.error('⚠️ لم يتم العثور على نموذج السيرة الذاتية');
        return;
    }

    // نتأكد أن عندنا inputs مخفية لاسم الباقة والسعر
    let packageNameInput = cvForm.querySelector('input[name="packageName"]');
    let packagePriceInput = cvForm.querySelector('input[name="packagePrice"]');

    if (!packageNameInput) {
        packageNameInput = document.createElement('input');
        packageNameInput.type = 'hidden';
        packageNameInput.name = 'packageName';
        cvForm.appendChild(packageNameInput);
    }

    if (!packagePriceInput) {
        packagePriceInput = document.createElement('input');
        packagePriceInput.type = 'hidden';
        packagePriceInput.name = 'packagePrice';
        cvForm.appendChild(packagePriceInput);
    }

    packageNameInput.value = packageName;
    packagePriceInput.value = packagePrice;

    // فتح المودال
    modal.classList.remove('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('✅ Modal opened successfully');
}

// إغلاق مودال السيرة الذاتية المجانية
function closeFreeCVModal() {
    const modal = document.getElementById('freeCVModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}
// mind.js

// mind.js

async function submitCVForm(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    console.log('🔵 بدء إرسال النموذج...');

    // 1. تحديد النموذج الذي تم إرساله بدقة (الحل السحري لمشكلة تكرار الـ IDs)
    const form = e.target;
    
    // 2. جمع البيانات تلقائياً بناءً على الـ names التي أضفتها في HTML
    const formData = new FormData(form);

    // 3. تجهيز الزر (تغيير النص لمنع التكرار)
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'إرسال';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
    }

    try {
        // التأكد من وجود التوكن (للمستخدمين المسجلين)
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 4. إرسال الطلب للسيرفر
        // ملاحظة: لا نضع Content-Type يدوياً، المتصفح يضعه تلقائياً مع FormData
        const response = await fetch(`${API_BASE_URL}/cv-requests`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const result = await response.json();
        console.log('🟢 نتيجة الطلب:', result);

        if (result.success) {
            // نجاح!
            if (typeof showNotification === 'function') {
                showNotification('✅ تم استلام طلبك بنجاح! سنتواصل معك قريباً.', 'success');
            } else {
                alert('✅ تم استلام طلبك بنجاح!');
            }
            
            // إغلاق المودال وتنظيف النموذج
            if (typeof closeFreeCVModal === 'function') closeFreeCVModal();
            form.reset();
        } else {
            // خطأ من السيرفر
            const msg = result.message || 'حدث خطأ أثناء إرسال الطلب';
            if (typeof showNotification === 'function') {
                showNotification('❌ ' + msg, 'error');
            } else {
                alert('❌ ' + msg);
            }
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال:', error);
        if (typeof showNotification === 'function') {
            showNotification('❌ خطأ في الاتصال بالخادم، تأكد من الإنترنت.', 'error');
        } else {
            alert('❌ خطأ في الاتصال بالخادم.');
        }
    } finally {
        // إعادة تفعيل الزر
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    return false;
}


// ابحث عن هذه الدالة وقم باستبدالها بالكامل
// في mind.js - استبدل دالة إرسال النموذج بهذه النسخة المحسنة



function initCVForm() {
    console.log('🔍 Searching for CV form...');
    
    const cvForm = document.getElementById('freeCVForm') || 
                   document.getElementById('cvBookingForm');

    if (!cvForm) {
        console.log('ℹ️ No CV form found on this page.');
        return;
    }

    // منع الـ listener من التكرار
    if (cvForm.dataset.listenerAttached === 'true') {
        console.log('⚠️ Listener already attached, skipping...');
        return;
    }
    
    cvForm.dataset.listenerAttached = 'true';
    console.log('✅ CV form found, attaching listener');

    // إلغاء أي onsubmit موجود في الـ HTML
    cvForm.onsubmit = null;

    cvForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation(); // منع أي handlers أخرى
        
        console.log('🔵 Form submission started...');

        const formData = new FormData(this);
        
        // إضافة البيانات المفقودة
        const fullNameEl = this.querySelector('#cvFullName, [name="fullName"]');
        const emailEl    = this.querySelector('#cvEmail, [name="email"]');
        const phoneEl    = this.querySelector('#cvPhone, [name="phone"]');
        const notesEl    = this.querySelector('#cvNotes, [name="notes"]');
        const levelEl    = this.querySelector('#cvCurrentLevel, [name="currentLevel"]');
        const jobTitleEl = this.querySelector('#cvTargetJobTitle, [name="targetJobTitle"]');
        const yearsEl    = this.querySelector('#cvYearsOfExperience, [name="yearsOfExperience"]');
        const linkedinEl = this.querySelector('#cvLinkedinProfile, [name="linkedinProfile"]');
        const fileEl     = this.querySelector('#cvFile, [name="cvFile"]');
        if (!formData.has('fullName') && fullNameEl) formData.append('fullName', fullNameEl.value);
        if (!formData.has('email') && emailEl) formData.append('email', emailEl.value);
        if (!formData.has('phone') && phoneEl) formData.append('phone', phoneEl.value);
        if (!formData.has('notes') && notesEl) formData.append('notes', notesEl.value);
        if (!formData.has('currentLevel') && levelEl) formData.append('currentLevel', levelEl.value);
        if (!formData.has('targetJobTitle') && jobTitleEl) formData.append('targetJobTitle', jobTitleEl.value);
        if (!formData.has('yearsOfExperience') && yearsEl) formData.append('yearsOfExperience', yearsEl.value);
        if (!formData.has('linkedinProfile') && linkedinEl) formData.append('linkedinProfile', linkedinEl.value);
        
        if (fileEl && fileEl.files[0]) {
            formData.append('cvFile', fileEl.files[0]);
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
        }

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            console.log('🧾 FormData entries:', [...formData.entries()]);

            const response = await fetch('http://localhost:5000/api/cv-requests', {
                method: 'POST',
                headers: headers,
                body: formData
            });

            console.log('🟣 Response status:', response.status);
            const result = await response.json();
            console.log('🟢 Response result:', result);

            if (response.ok && result.success) {
                alert('✅ تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
                if (typeof closeFreeCVModal === 'function') closeFreeCVModal();
                this.reset();
            } else {
                alert('❌ ' + (result.message || 'حدث خطأ أثناء إرسال الطلب'));
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ خطأ في الاتصال بالخادم');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        }
    }, true); // true = استخدام capture phase
}
// تشغيل الدالة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCVForm);
} else {
    initCVForm();
}



// ... (الكود السابق في بداية الملف) ...

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function() {
    checkAuthStatus();
    initializeEventListeners();
    initializeRestOfFunctionality();
    loadInitialData();
});

// ... (الكود السابق) ...

function getPaymentStatusText(status) {
    // ... (الكود السابق) ...
}

// ✅ --- START: أضف هذه الدوال الجديدة --- ✅

function getCvRequestStatusText(status) {
    switch (status) {
        case 'pending': return 'بانتظار المراجعة';
        case 'in_progress': return 'قيد المتابعة';
        case 'completed': return 'منتهي';
        case 'cancelled': return 'ملغي';
        default: return status;
    }
}



function openAdminSection(sectionName) {
    // إخفاء كل أقسام الأدمن
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.style.display = 'none';
    });

    // إظهار القسم المطلوب إذا موجود
    const sectionEl = document.getElementById(`admin-${sectionName}`);
    if (sectionEl) {
        sectionEl.style.display = 'block';
    }

    if (sectionName === 'dashboard') loadDashboardStats();
    if (sectionName === 'users') loadAdminUsers();
    if (sectionName === 'packages') loadAdminPackages();
    if (sectionName === 'mentors') loadAdminMentors();
    if (sectionName === 'orders') loadAdminOrders();
    if (sectionName === 'sessions') loadAdminSessions();

    // قسم طلبات السيرة الذاتية
    if (sectionName === 'cv-requests') loadAdminCvRequests();
}



async function updateCvRequestStatus(selectEl, requestId) {
    const newStatus = selectEl.value;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/cv-requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم تحديث حالة الطلب بنجاح', 'success');
        } else {
            showNotification('فشل تحديث الحالة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}


// (دالة جديدة) تحميل طلبات السيرة الذاتية (للمدير)
async function loadAdminCvRequests() {
    const container = document.getElementById('cvRequestsAdminContainer');
    if (!container) return;
    container.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto mb-4"></div><p>جاري تحميل الطلبات...</p></div>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/cv-requests/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.requests.length > 0) {
            container.innerHTML = '';
            result.requests.forEach(req => {
                const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];
                const statusDropdown = `<select class="admin-table-select" onchange="updateCvRequestStatus(this, '${req._id}')">
                    ${statusOptions.map(s => `<option value="${s}" ${req.status === s ? 'selected' : ''}>${getCvRequestStatusText(s)}</option>`).join('')}
                </select>`;

                const card = document.createElement('div');
                card.className = 'border rounded-lg p-4 mb-4';
                card.style.cssText = 'background: var(--card-bg); border-color: var(--border-color);';
                card.innerHTML = `
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h5 class="font-bold" style="color: var(--text-dark);">${req.packageName}</h5>
                            <p class="text-sm text-slate-400">بواسطة: ${req.user ? req.user.name : req.fullName} (${req.phone})</p>
                        </div>
                        <span class="text-lg font-bold text-primary">${req.packagePrice} د.أ</span>
                    </div>
                    <p class="text-sm text-slate-400 mb-3">تاريخ الطلب: ${formatDate(req.createdAt)}</p>
                    ${req.notes ? `<p class="text-sm p-3 rounded bg-background border border-border-color mb-3"><b>ملاحظات:</b> ${req.notes}</p>` : ''}
                    
                    <div class="grid grid-cols-2 gap-3 text-sm mb-4 p-3 rounded-lg" style="background: var(--background);">
                        <div>
                            <p style="color: var(--text-light);">المستوى:</p>
                            <p class="font-medium" style="color: var(--text-dark);">${req.currentLevel || '-'}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-light);">سنوات الخبرة:</p>
                            <p class="font-medium" style="color: var(--text-dark);">${req.yearsOfExperience} سنوات</p>
                        </div>
                        <div class="col-span-2">
                            <p style="color: var(--text-light);">المسمى المستهدف:</p>
                            <p class="font-medium" style="color: var(--text-dark);">${req.targetJobTitle || '-'}</p>
                        </div>
                        ${req.linkedinProfile ? `
                        <div class="col-span-2">
                            <p style="color: var(--text-light);">ملف لينكدإن:</p>
                            <a href="${req.linkedinProfile}" target="_blank" class="font-medium text-primary hover:underline">${req.linkedinProfile}</a>
                        </div>` : ''}
                    </div>
                    <div class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-2">
                            <label class="text-sm">الحالة:</label>
                            ${statusDropdown}
                        </div>
                        ${req.cvFilePath ? `<a href="${API_BASE_URL}/${req.cvFilePath.replace(/\\/g, '/')}" target="_blank" class="btn-secondary"><i class="fas fa-download"></i> تحميل الـ CV</a>` : '<span class="text-sm text-slate-500">لم يتم رفع ملف</span>'}
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="text-center py-8" style="color: var(--text-light);">لا توجد طلبات سيرة ذاتية.</p>';
        }
    } catch (error) {
        console.error("Failed to load CV requests:", error);
        container.innerHTML = '<p class="text-center text-red-500">فشل في تحميل الطلبات.</p>';
    }
}

// (دالة جديدة) تحديث حالة طلب السيرة الذاتية (للمدير)
async function updateCvRequestStatus(selectElement, requestId) {
    const newStatus = selectElement.value;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/cv-requests/${requestId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم تحديث حالة الطلب بنجاح', 'success');
        } else {
            showNotification('فشل تحديث الحالة', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// تجيب طلبات السيرة الذاتية وترجعها كمصفوفة
async function loadUserCvRequests_Internal() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('لم يتم تسجيل الدخول');
    }

    const response = await fetch(`${API_BASE_URL}/cv-requests/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();
    console.log('CV requests response:', result);

    if (result.success && Array.isArray(result.requests)) {
        return result.requests;
    }

    return [];
}


// ✅ --- END: الدوال الجديدة --- ✅


// ... (الكود السابق) ...

// (تعديل) تحديث دالة عرض الطلبات لتشمل طلبات السيرة الذاتية
function displayUserOrders(orders) {
    const container = document.getElementById('ordersContainer');

    if (!orders || orders.length === 0) {
        // لا تقم بعرض "لا توجد طلبات" فوراً، انتظر تحميل طلبات السيفي
    } else {
        container.innerHTML += orders.map(order => `
            <div class="border rounded-lg p-4 mb-4" style="background: var(--card-bg);">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-lg" style="color: var(--text-dark);">طلب باقة: ${order.package ? order.package.name : (order.packageName || 'باقة غير محددة')}</h4>
                        <p class="text-sm text-gray-400">تاريخ الطلب: ${formatDate(order.createdAt)}</p>
                    </div>
                    <span class="status-badge status-${order.status}">${getOrderStatusText(order.status)}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>المرشد:</strong> ${order.mentor ? order.mentor.name : 'غير محدد'}</p>
                    </div>
                    <div>
                        <p><strong>المبلغ:</strong> ${order.totalAmount} د.أ</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ✅ --- START: التعديل هنا --- ✅
    // استدعاء دالة جلب طلبات السيفي بعد جلب الطلبات العادية
    loadUserCvRequests(container).then(() => {
        // الآن، بعد تحميل كلا النوعين، تحقق إذا كانت الحاوية لا تزال فارغة
        if (container.innerHTML.trim() === '') {
            container.innerHTML = '<div class="text-center py-8"><p style="color: var(--text-light);">لا توجد أي طلبات حالياً.</p></div>';
        }
    });
    // ✅ --- END: التعديل هنا --- ✅
}


document.addEventListener('DOMContentLoaded', function() {
    initCVForm();
});

// تشغيل تلقائي عند تحميل الصفحة - بدون تكرار
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🟢 Page loaded, initializing CV form...');
            setTimeout(initCVForm, 100); // تأخير صغير للتأكد من تحميل كل العناصر
        });
    } else {
        console.log('🟢 Page already loaded, initializing CV form...');
        setTimeout(initCVForm, 100);
    }
})();



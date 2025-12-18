// multi-step-form.js (Updated with Selection Fix)

let currentFormStep = 1;
const totalSteps = 4;
let formOptionsData = {};
let formData = {
    fullName: '', email: '', phone: '',
    currentLevel: '', major: '', primaryGoal: '',
    preferredTime: '', paymentMethod: ''
};

const packageDurations = {
    'باقة الخريج': 180, 'باقة الانطلاقة': 120,
    'جلسة استشارية': 60, 'الباقة الذهبية': 10
};

async function loadFormOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/form-options/all`);
        const result = await response.json();
        if (result.success) formOptionsData = result.formOptions;
    } catch (error) { console.error('Error loading form options:', error); }
}

async function initializeMultiStepForm() {
    await loadFormOptions();
    renderFormStep(currentFormStep);
    updateProgressBar();
    updateNavigationButtons();
}

// --- ✅ START: New Helper Function for Selection ---
function handleRadioSelection(event) {
    const clickedLabel = event.currentTarget;
    const radioInput = clickedLabel.querySelector('input[type="radio"]');
    if (!radioInput) return;

    // Unselect all other labels in the same group
    const groupName = radioInput.name;
    document.querySelectorAll(`input[name="${groupName}"]`).forEach(input => {
        input.parentElement.classList.remove('selected-option');
    });

    // Select the clicked one
    clickedLabel.classList.add('selected-option');
    radioInput.checked = true; // Ensure the underlying radio is checked
}
// --- ✅ END: New Helper Function ---

function renderFormStep(step) {
    const container = document.getElementById('formStepContainer');
    if (!container) return;
    
    let stepHTML = '';
    const duration = selectedPackage ? (packageDurations[selectedPackage.name] || 'N/A') : 'N/A';
    const packageInfo = selectedPackage ? `
        <div class="p-4 rounded-lg mb-6" style="background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.2);">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold text-lg" style="color: var(--text-dark);">${selectedPackage.name}</p>
                    <p class="text-sm font-medium" style="color: var(--text-light);"><i class="fas fa-clock ml-1"></i> مدة الجلسة: ${duration} دقيقة</p>
                </div>
                <div class="text-left">
                    <p class="font-bold text-2xl text-primary">${selectedPackage.price}</p>
                    <p class="text-sm" style="color: var(--text-light);">دينار أردني</p>
                </div>
            </div>
        </div>` : '';

    switch(step) {
        case 1:
            stepHTML = `
                <div class="form-step active">
                    ${packageInfo}
                    <h3 class="text-2xl font-bold mb-2">1. معلوماتك الشخصية</h3>
                    <p class="mb-6 text-slate-400">نحتاج هذه المعلومات الأساسية للتواصل معك.</p>
                    <div class="space-y-4">
                        <div class="form-group"><label for="stepFullName" class="block mb-2 font-medium">الاسم الكامل *</label><input type="text" id="stepFullName" value="${currentUser?.name || formData.fullName}" required class="w-full p-3 rounded-lg border-2 bg-background border-border-color" placeholder="أدخل اسمك الكامل"></div>
                        <div class="form-group"><label for="stepEmail" class="block mb-2 font-medium">البريد الإلكتروني *</label><input type="email" id="stepEmail" value="${currentUser?.email || formData.email}" required class="w-full p-3 rounded-lg border-2 bg-background border-border-color" placeholder="example@email.com"></div>
                        <div class="form-group"><label for="stepPhone" class="block mb-2 font-medium">رقم الهاتف *</label><input type="tel" id="stepPhone" value="${currentUser?.phone || formData.phone}" required class="w-full p-3 rounded-lg border-2 bg-background border-border-color" placeholder="07XXXXXXXX"></div>
                    </div>
                </div>`;
            break;
            
        case 2:
            const currentLevelOptions = formOptionsData.stepCurrentLevel?.options || [
                { value: 'high-school', label: 'طالب ثانوية' }, { value: 'university', label: 'طالب جامعي' },
                { value: 'fresh-graduate', label: 'خريج جديد' }, { value: 'employee', label: 'موظف' }
            ];
            const primaryGoalOptions = [
                { value: 'major-selection', label: 'المساعدة في اختيار التخصص الجامعي' }, { value: 'job-prep', label: 'التحضير لسوق العمل (سيرة ذاتية، مقابلات)' },
                { value: 'skill-dev', label: 'تطوير المهارات الوظيفية والحصول على ترقية' }, { value: 'career-change', label: 'استكشاف خيارات لتغيير المسار المهني' },
                { value: 'general-consultation', label: 'استشارة عامة وبناء خطة عمل' }
            ];

            stepHTML = `
                <div class="form-step active">
                    ${packageInfo}
                    <h3 class="text-2xl font-bold mb-6">2. الهدف من الجلسة</h3>
                    <div class="space-y-6">
                        <div class="form-group">
                            <label class="block mb-2 font-medium">ما هو وضعك الحالي؟ *</label>
                            <div class="grid grid-cols-2 gap-2">
                                ${currentLevelOptions.map(opt => `
                                    <label class="radio-label p-3 rounded-lg border-2 cursor-pointer ${formData.currentLevel === opt.value ? 'selected-option' : ''}" style="border-color: var(--border-color);" onclick="handleRadioSelection(event)">
                                        <input type="radio" name="currentLevel" value="${opt.value}" class="sr-only" ${formData.currentLevel === opt.value ? 'checked' : ''}>
                                        <span class="font-medium">${opt.label}</span>
                                    </label>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="stepMajor" class="block mb-2 font-medium">ما هو تخصصك الدراسي أو مجالك الحالي؟ *</label>
                            <input type="text" id="stepMajor" value="${formData.major}" required class="w-full p-3 rounded-lg border-2 bg-background border-border-color" placeholder="مثال: هندسة برمجيات، تسويق، طالب أدبي...">
                        </div>
                        <div class="form-group">
                            <label class="block mb-2 font-medium">ما هو هدفك الأساسي من هذه الجلسة؟ *</label>
                             <div class="grid grid-cols-1 gap-2">
                                ${primaryGoalOptions.map(opt => `
                                    <label class="radio-label p-3 rounded-lg border-2 cursor-pointer ${formData.primaryGoal === opt.value ? 'selected-option' : ''}" style="border-color: var(--border-color);" onclick="handleRadioSelection(event)">
                                        <input type="radio" name="primaryGoal" value="${opt.value}" class="sr-only" ${formData.primaryGoal === opt.value ? 'checked' : ''}>
                                        <span class="font-medium">${opt.label}</span>
                                    </label>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
            
        case 3:
             const preferredTimeOptions = formOptionsData.stepPreferredTime?.options || [
                { value: 'morning', label: 'صباحاً (9ص - 12ظ)' }, { value: 'afternoon', label: 'بعد الظهر (1ظ - 5م)' }, { value: 'evening', label: 'مساءً (6م - 9م)' }
            ];
            stepHTML = `
                <div class="form-step active">
                    ${packageInfo}
                    <h3 class="text-2xl font-bold mb-6">3. اختر مرشدك والوقت المناسب</h3>
                    <div class="space-y-6">
                        <div class="form-group">
                            <label class="block mb-2 font-medium">اختر المرشد (اختياري)</label>
                            <div class="grid grid-cols-1 gap-2" id="mentorSelectionContainer">
                                <div class="radio-label p-3 rounded-lg border-2 cursor-pointer flex items-center gap-3" style="border-color: var(--border-color);" onclick="selectMentorInForm(null, this)">
                                    <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center"><i class="fas fa-users"></i></div>
                                    <div><p class="font-medium">اختيار تلقائي (سنختار لك الأنسب)</p></div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="block mb-2 font-medium">ما هو الوقت المفضل للجلسة؟ *</label>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                                ${preferredTimeOptions.map(opt => `
                                    <label class="radio-label p-3 text-center rounded-lg border-2 cursor-pointer ${formData.preferredTime === opt.value ? 'selected-option' : ''}" style="border-color: var(--border-color);" onclick="handleRadioSelection(event)">
                                        <input type="radio" name="preferredTime" value="${opt.value}" class="sr-only" ${formData.preferredTime === opt.value ? 'checked' : ''}>
                                        <span class="font-medium">${opt.label}</span>
                                    </label>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
            setTimeout(() => loadMentorsForSelection(), 100);
            break;

        case 4:
            const mentorName = selectedMentor ? selectedMentor.name : 'اختيار تلقائي';
            stepHTML = `
                <div class="form-step active">
                    ${packageInfo}
                    <h3 class="text-2xl font-bold mb-6">4. ملخص الطلب والدفع</h3>
                    <div class="p-4 rounded-lg mb-6 bg-card-bg border border-border-color">
                        <h4 class="font-bold mb-3">ملخص طلبك</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-slate-400">الاسم:</span><span class="font-medium">${formData.fullName}</span></div>
                            <div class="flex justify-between"><span class="text-slate-400">المرشد:</span><span class="font-medium">${mentorName}</span></div>
                            <div class="flex justify-between"><span class="text-slate-400">الهدف:</span><span class="font-medium">${document.querySelector(`input[name="primaryGoal"][value="${formData.primaryGoal}"]`)?.nextElementSibling.textContent || formData.primaryGoal}</span></div>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <label class="block mb-2 font-medium">اختر طريقة الدفع *</label>
                        <div class="payment-option p-3 rounded-lg cursor-pointer border-2" style="border-color: var(--border-color);" onclick="selectPaymentMethod('cliq', this)">
                            <h5 class="font-bold">الدفع عبر CliQ</h5>
                            <p class="text-sm text-slate-400">سيتم تزويدك بالمعلومات بعد تأكيد الطلب</p>
                        </div>
                        <div class="payment-option p-3 rounded-lg cursor-pointer border-2" style="border-color: var(--border-color);" onclick="selectPaymentMethod('later', this)">
                            <h5 class="font-bold">الدفع لاحقاً</h5>
                            <p class="text-sm text-slate-400">سيتم التواصل معك هاتفياً لتأكيد الطلب والدفع</p>
                        </div>
                    </div>
                </div>`;
            break;
    }
    container.innerHTML = stepHTML;
}

function saveCurrentStepData() {
    formData.fullName = document.getElementById('stepFullName')?.value || formData.fullName;
    formData.email = document.getElementById('stepEmail')?.value || formData.email;
    formData.phone = document.getElementById('stepPhone')?.value || formData.phone;
    formData.currentLevel = document.querySelector('input[name="currentLevel"]:checked')?.value || formData.currentLevel;
    formData.major = document.getElementById('stepMajor')?.value || formData.major;
    formData.primaryGoal = document.querySelector('input[name="primaryGoal"]:checked')?.value || formData.primaryGoal;
    formData.preferredTime = document.querySelector('input[name="preferredTime"]:checked')?.value || formData.preferredTime;
}

function validateCurrentStep() {
    saveCurrentStepData(); // Ensure latest data is saved before validation
    switch(currentFormStep) {
        case 1:
            if (!formData.fullName.trim()) { showNotification('يرجى إدخال الاسم الكامل', 'error'); return false; }
            if (!formData.email.trim()) { showNotification('يرجى إدخال البريد الإلكتروني', 'error'); return false; }
            if (!formData.phone.trim()) { showNotification('يرجى إدخال رقم الهاتف', 'error'); return false; }
            break;
        case 2:
            if (!formData.currentLevel) { showNotification('يرجى تحديد وضعك الحالي', 'error'); return false; }
            if (!formData.major.trim()) { showNotification('يرجى إدخال تخصصك أو مجالك', 'error'); return false; }
            if (!formData.primaryGoal) { showNotification('يرجى تحديد هدفك الأساسي', 'error'); return false; }
            break;
        case 3:
            if (!formData.preferredTime) { showNotification('يرجى اختيار الوقت المفضل', 'error'); return false; }
            break;
        case 4:
            if (!formData.paymentMethod) { showNotification('يرجى اختيار طريقة الدفع', 'error'); return false; }
            break;
    }
    return true;
}

function loadMentorsForSelection() {
    const container = document.getElementById('mentorSelectionContainer');
    if (!container || !selectedPackage || !Array.isArray(selectedPackage.mentors) || selectedPackage.mentors.length === 0) {
        container.parentElement.style.display = 'none'; return;
    }
    selectedPackage.mentors.forEach(mentor => {
        const mentorCard = document.createElement('div');
        mentorCard.className = `radio-label p-3 rounded-lg border-2 cursor-pointer flex items-center gap-3 transition-all ${selectedMentor?._id === mentor._id ? 'selected-option' : ''}`;
        mentorCard.style.borderColor = 'var(--border-color)';
        mentorCard.dataset.mentorId = mentor._id;
        mentorCard.onclick = () => selectMentorInForm(mentor, mentorCard);
        
        mentorCard.innerHTML = `
            <img src="${mentor.avatar || 'https://placehold.co/40x40/4338ca/fff?text=' + mentor.name.charAt(0)}" class="w-10 h-10 rounded-full object-cover" alt="${mentor.name}">
            <div>
                <p class="font-medium">${mentor.name}</p>
                <p class="text-xs text-slate-400">${mentor.title || 'مرشد'}</p>
            </div>`;
        container.appendChild(mentorCard);
    });
}

function selectMentorInForm(mentor, element) {
    selectedMentor = mentor;
    document.querySelectorAll('#mentorSelectionContainer > div').forEach(card => card.classList.remove('selected-option'));
    element.classList.add('selected-option');
}

function nextFormStep() {
    if (!validateCurrentStep()) return;
    if (currentFormStep < totalSteps) {
        currentFormStep++;
        renderFormStep(currentFormStep);
        updateProgressBar();
        updateNavigationButtons();
    }
}

function previousFormStep() {
    saveCurrentStepData(); // Save data before going back
    if (currentFormStep > 1) {
        currentFormStep--;
        renderFormStep(currentFormStep);
        updateProgressBar();
        updateNavigationButtons();
    }
}

function updateProgressBar() {
    const progress = ((currentFormStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('multiStepProgress').style.width = `${progress}%`;
    document.getElementById('currentStepText').textContent = `الخطوة ${currentFormStep} من ${totalSteps}`;
}

function updateNavigationButtons() {
    document.getElementById('prevStepBtn').style.display = currentFormStep === 1 ? 'none' : 'block';
    document.getElementById('nextStepBtn').style.display = currentFormStep === totalSteps ? 'none' : 'block';
    document.getElementById('submitFormBtn').style.display = currentFormStep === totalSteps ? 'block' : 'none';
}

function selectPaymentMethod(method, element) {
    formData.paymentMethod = method;
    document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('selected-option'));
    element.classList.add('selected-option');
}

async function submitMultiStepForm() {
    if (!validateCurrentStep()) return;
    const submitBtn = document.getElementById('submitFormBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الإرسال...';

    const orderData = {
        packageId: selectedPackage._id,
        mentorId: selectedMentor ? selectedMentor._id : null,
        ...formData
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم إرسال طلبك بنجاح!', 'success');
            closeMultiStepForm();
        } else {
            showNotification(result.message || 'فشل في إرسال الطلب', 'error');
        }
    } catch (error) {
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'تأكيد الطلب والدفع';
    }
}

function openMultiStepForm() {
    const modal = document.getElementById('multiStepFormModal');
    if (!modal) return;
    modal.style.display = 'flex';
    currentFormStep = 1;
    formData = { fullName: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' };
    selectedMentor = null;
    initializeMultiStepForm();
}

function closeMultiStepForm() {
    const modal = document.getElementById('multiStepFormModal');
    if (modal) modal.style.display = 'none';
}

// Global exports
if (typeof window !== 'undefined') {
    window.nextFormStep = nextFormStep;
    window.previousFormStep = previousFormStep;
    window.submitMultiStepForm = submitMultiStepForm;
    window.openMultiStepForm = openMultiStepForm;
    window.closeMultiStepForm = closeMultiStepForm;
    window.selectMentorInForm = selectMentorInForm;
    window.selectPaymentMethod = selectPaymentMethod;
    window.handleRadioSelection = handleRadioSelection;
}
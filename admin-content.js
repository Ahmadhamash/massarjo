// إدارة المحتوى الديناميكي للصفحة الرئيسية

let contentData = {};

// ==============================================
// تحميل المحتوى الحالي
// ==============================================

async function loadContentManagement() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/content/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            contentData = result.data;
            displayContentSections();
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showNotification('فشل في تحميل المحتوى', 'error');
    }
}

function displayContentSections() {
    const container = document.getElementById('contentManagementContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="space-y-6">
            ${generateHeroSection()}
            ${generateHowItWorksSection()}
            ${generateAchievementsSection()}
            ${generateServicesSection()}
            ${generateTestimonialsSection()}
        </div>
    `;
}

// ==============================================
// Hero Section
// ==============================================

function generateHeroSection() {
    const hero = contentData.hero || {};
    
    return `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <h3 class="text-2xl font-bold mb-4" style="color: var(--text-dark);">قسم البطل (Hero)</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block mb-2 font-medium" style="color: var(--text-dark);">العنوان الرئيسي</label>
                    <input type="text" id="heroTitle" value="${hero.title || ''}" class="w-full p-3 rounded-lg border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                </div>
                
                <div>
                    <label class="block mb-2 font-medium" style="color: var(--text-dark);">النص الفرعي</label>
                    <textarea id="heroSubtitle" rows="2" class="w-full p-3 rounded-lg border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">${hero.subtitle || ''}</textarea>
                </div>
                
                <div>
                    <label class="block mb-2 font-medium" style="color: var(--text-dark);">المربعات الخضراء</label>
                    ${(hero.badges || []).map((badge, index) => `
                        <div class="flex gap-2 mb-2">
                            <input type="text" id="heroBadge${index}Text" value="${badge.text || ''}" placeholder="النص" class="flex-1 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                            <input type="text" id="heroBadge${index}Icon" value="${badge.icon || ''}" placeholder="الأيقونة" class="w-32 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="saveHeroSection()" class="admin-btn-primary">حفظ التغييرات</button>
            </div>
        </div>
    `;
}

async function saveHeroSection() {
    const heroData = {
        title: document.getElementById('heroTitle').value,
        subtitle: document.getElementById('heroSubtitle').value,
        badges: [
            {
                text: document.getElementById('heroBadge0Text').value,
                icon: document.getElementById('heroBadge0Icon').value
            },
            {
                text: document.getElementById('heroBadge1Text').value,
                icon: document.getElementById('heroBadge1Icon').value
            },
            {
                text: document.getElementById('heroBadge2Text').value,
                icon: document.getElementById('heroBadge2Icon').value
            }
        ]
    };
    
    await saveContentSection('hero', heroData);
}

// ==============================================
// How It Works Section
// ==============================================

function generateHowItWorksSection() {
    const howItWorks = contentData.howItWorks || { steps: [] };
    
    return `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <h3 class="text-2xl font-bold mb-4" style="color: var(--text-dark);">قسم كيف نعمل</h3>
            
            <div class="space-y-4">
                ${(howItWorks.steps || []).map((step, index) => `
                    <div class="p-4 rounded-lg" style="background: var(--background); border: 1px solid var(--border-color);">
                        <h4 class="font-bold mb-3" style="color: var(--text-dark);">الخطوة ${index + 1}</h4>
                        <div class="space-y-2">
                            <input type="text" id="step${index}Title" value="${step.title || ''}" placeholder="العنوان" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                            <textarea id="step${index}Description" rows="2" placeholder="الوصف" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">${step.description || ''}</textarea>
                            <input type="text" id="step${index}Icon" value="${step.icon || ''}" placeholder="الأيقونة" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                        </div>
                    </div>
                `).join('')}
                
                <button onclick="saveHowItWorksSection()" class="admin-btn-primary">حفظ التغييرات</button>
            </div>
        </div>
    `;
}

async function saveHowItWorksSection() {
    const stepsData = {
        steps: [
            {
                number: '01',
                title: document.getElementById('step0Title').value,
                description: document.getElementById('step0Description').value,
                icon: document.getElementById('step0Icon').value
            },
            {
                number: '02',
                title: document.getElementById('step1Title').value,
                description: document.getElementById('step1Description').value,
                icon: document.getElementById('step1Icon').value
            },
            {
                number: '03',
                title: document.getElementById('step2Title').value,
                description: document.getElementById('step2Description').value,
                icon: document.getElementById('step2Icon').value
            }
        ]
    };
    
    await saveContentSection('howItWorks', stepsData);
}

// ==============================================
// Achievements Section
// ==============================================

function generateAchievementsSection() {
    const achievements = contentData.achievements || { stats: [] };
    
    return `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <h3 class="text-2xl font-bold mb-4" style="color: var(--text-dark);">قسم الإنجازات</h3>
            
            <div class="space-y-4">
                ${(achievements.stats || []).map((stat, index) => `
                    <div class="flex gap-4">
                        <input type="text" id="achievement${index}Number" value="${stat.number || ''}" placeholder="الرقم" class="w-32 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                        <input type="text" id="achievement${index}Label" value="${stat.label || ''}" placeholder="الوصف" class="flex-1 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                        <input type="text" id="achievement${index}Icon" value="${stat.icon || ''}" placeholder="الأيقونة" class="w-32 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                    </div>
                `).join('')}
                
                <button onclick="saveAchievementsSection()" class="admin-btn-primary">حفظ التغييرات</button>
            </div>
        </div>
    `;
}

async function saveAchievementsSection() {
    const achievementsData = {
        stats: [
            {
                number: document.getElementById('achievement0Number').value,
                label: document.getElementById('achievement0Label').value,
                icon: document.getElementById('achievement0Icon').value
            },
            {
                number: document.getElementById('achievement1Number').value,
                label: document.getElementById('achievement1Label').value,
                icon: document.getElementById('achievement1Icon').value
            },
            {
                number: document.getElementById('achievement2Number').value,
                label: document.getElementById('achievement2Label').value,
                icon: document.getElementById('achievement2Icon').value
            }
        ]
    };
    
    await saveContentSection('achievements', achievementsData);
}

// ==============================================
// Services Section (Tabs)
// ==============================================

function generateServicesSection() {
    const services = contentData.services || { tabs: [] };
    
    return `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <h3 class="text-2xl font-bold mb-4" style="color: var(--text-dark);">قسم الخدمات (التبويبات)</h3>
            
            <div class="space-y-6">
                ${(services.tabs || []).map((tab, index) => `
                    <div class="p-4 rounded-lg" style="background: var(--background); border: 1px solid var(--border-color);">
                        <h4 class="font-bold mb-3" style="color: var(--text-dark);">تبويب ${index + 1}: ${tab.title || ''}</h4>
                        <div class="space-y-3">
                            <input type="text" id="service${index}Title" value="${tab.title || ''}" placeholder="العنوان" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                            <textarea id="service${index}Points" rows="4" placeholder="النقاط (سطر لكل نقطة)" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">${(tab.points || []).join('\n')}</textarea>
                            <input type="text" id="service${index}Image" value="${tab.image || ''}" placeholder="رابط الصورة" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                        </div>
                    </div>
                `).join('')}
                
                <button onclick="saveServicesSection()" class="admin-btn-primary">حفظ التغييرات</button>
            </div>
        </div>
    `;
}

async function saveServicesSection() {
    const servicesData = {
        tabs: [
            {
                id: 'holland',
                title: document.getElementById('service0Title').value,
                points: document.getElementById('service0Points').value.split('\n').filter(p => p.trim()),
                image: document.getElementById('service0Image').value
            },
            {
                id: 'ai-plan',
                title: document.getElementById('service1Title').value,
                points: document.getElementById('service1Points').value.split('\n').filter(p => p.trim()),
                image: document.getElementById('service1Image').value
            },
            {
                id: 'mentorship',
                title: document.getElementById('service2Title').value,
                points: document.getElementById('service2Points').value.split('\n').filter(p => p.trim()),
                image: document.getElementById('service2Image').value
            }
        ]
    };
    
    await saveContentSection('services', servicesData);
}

// ==============================================
// Testimonials Section
// ==============================================

function generateTestimonialsSection() {
    const testimonials = contentData.testimonials || [];
    
    return `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold" style="color: var(--text-dark);">قصص النجاح (شهادات العملاء)</h3>
                <button onclick="addTestimonial()" class="admin-btn-primary">إضافة شهادة</button>
            </div>
            
            <div id="testimonialsListContainer" class="space-y-4">
                ${(testimonials || []).map((testimonial, index) => `
                    <div class="p-4 rounded-lg" style="background: var(--background); border: 1px solid var(--border-color);">
                        <div class="flex justify-between items-start mb-3">
                            <h4 class="font-bold" style="color: var(--text-dark);">شهادة ${index + 1}</h4>
                            <button onclick="removeTestimonial(${index})" class="text-red-500 hover:text-red-700">×</button>
                        </div>
                        <div class="space-y-2">
                            <input type="text" id="testimonial${index}Name" value="${testimonial.name || ''}" placeholder="الاسم" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                            <input type="text" id="testimonial${index}Role" value="${testimonial.role || ''}" placeholder="الصفة" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                            <textarea id="testimonial${index}Text" rows="3" placeholder="نص الشهادة" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">${testimonial.text || ''}</textarea>
                            <input type="number" id="testimonial${index}Rating" value="${testimonial.rating || 5}" min="1" max="5" placeholder="التقييم" class="w-24 p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                            <input type="text" id="testimonial${index}Avatar" value="${testimonial.avatar || ''}" placeholder="رابط الصورة" class="w-full p-2 rounded border" style="background: var(--card-bg); border-color: var(--border-color); color: var(--text-dark);">
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button onclick="saveTestimonialsSection()" class="admin-btn-primary mt-4">حفظ التغييرات</button>
        </div>
    `;
}

function addTestimonial() {
    if (!contentData.testimonials) contentData.testimonials = [];
    
    contentData.testimonials.push({
        name: '',
        role: '',
        text: '',
        rating: 5,
        avatar: ''
    });
    
    displayContentSections();
}

function removeTestimonial(index) {
    if (!confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return;
    
    contentData.testimonials.splice(index, 1);
    displayContentSections();
}

async function saveTestimonialsSection() {
    const testimonialsData = [];
    let index = 0;
    
    while (document.getElementById(`testimonial${index}Name`)) {
        testimonialsData.push({
            name: document.getElementById(`testimonial${index}Name`).value,
            role: document.getElementById(`testimonial${index}Role`).value,
            text: document.getElementById(`testimonial${index}Text`).value,
            rating: Number(document.getElementById(`testimonial${index}Rating`).value),
            avatar: document.getElementById(`testimonial${index}Avatar`).value
        });
        index++;
    }
    
    await saveContentSection('testimonials', testimonialsData);
}

// ==============================================
// Save Content Section
// ==============================================

async function saveContentSection(sectionName, content) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/content/${sectionName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حفظ التغييرات بنجاح', 'success');
            loadContentManagement();
        } else {
            showNotification(result.message || 'فشل في حفظ التغييرات', 'error');
        }
    } catch (error) {
        console.error('Error saving content:', error);
        showNotification('حدث خطأ أثناء الحفظ', 'error');
    }
}

// Export functions to window
if (typeof window !== 'undefined') {
    window.loadContentManagement = loadContentManagement;
    window.saveHeroSection = saveHeroSection;
    window.saveHowItWorksSection = saveHowItWorksSection;
    window.saveAchievementsSection = saveAchievementsSection;
    window.saveServicesSection = saveServicesSection;
    window.saveTestimonialsSection = saveTestimonialsSection;
    window.addTestimonial = addTestimonial;
    window.removeTestimonial = removeTestimonial;
}

// ملف شامل لإدارة لوحة التحكم الكاملة

// متغيرات عامة
let allAdminUsersData = [];
let allAdminPackagesData = [];
let allAdminMentorsData = [];
let allAdminOrdersData = [];
let allAdminSessionsData = [];

// ==============================================
// DASHBOARD - لوحة المعلومات الرئيسية
// ==============================================

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const stats = result.stats.overview;
            
            // تحديث بطاقات الإحصائيات
            document.querySelector('[data-stat="totalUsers"]').textContent = stats.totalUsers || 0;
            document.querySelector('[data-stat="totalOrders"]').textContent = stats.totalOrders || 0;
            document.querySelector('[data-stat="completedSessions"]').textContent = stats.completedSessions || 0;
            document.querySelector('[data-stat="activeMentors"]').textContent = stats.activeMentors || 0;
            
            // الإحصائيات السريعة
            document.querySelector('[data-stat="satisfactionRate"]').textContent = `${stats.satisfactionRate}%` || '0%';
            document.querySelector('[data-stat="avgResponseTime"]').textContent = `${stats.avgResponseTime} ساعة` || '0 ساعة';
            document.querySelector('[data-stat="monthlyRevenue"]').textContent = `${stats.monthlyRevenue} د.أ` || '0 د.أ';
            document.querySelector('[data-stat="avgRating"]').textContent = `${stats.avgRating}/5` || '0/5';
            
            // تحديث الطلبات الأخيرة
            displayRecentOrders(result.stats.recent.orders || []);
            
            // رسم الإيرادات
            drawRevenueChart(result.stats.chart.monthlyRevenue || []);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('فشل في تحميل إحصائيات لوحة التحكم', 'error');
    }
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrdersContainer');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center;">لا توجد طلبات حديثة</p>';
        return;
    }
    
    container.innerHTML = orders.slice(0, 5).map(order => `
        <div class="p-3 rounded-lg mb-2" style="background: var(--background); border: 1px solid var(--border-color);">
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-medium" style="color: var(--text-dark);">${order.packageName || 'باقة'}</p>
                    <p class="text-sm" style="color: var(--text-light);">${order.user?.name || order.customerInfo?.name || 'مستخدم'}</p>
                </div>
                <div class="text-left">
                    <p class="font-bold" style="color: var(--primary);">${order.packagePrice || order.totalAmount} د.أ</p>
                    <span class="text-xs px-2 py-1 rounded ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function drawRevenueChart(data) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // تحويل البيانات للرسم
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const chartData = data.map(d => ({
        month: months[d._id.month - 1],
        revenue: d.revenue
    }));
    
    // رسم بسيط (يمكن استخدام Chart.js للمزيد من التفاصيل)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4f46e5';
    ctx.font = '12px Arial';
    
    const barWidth = canvas.width / (chartData.length || 1);
    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
    
    chartData.forEach((item, index) => {
        const height = (item.revenue / maxRevenue) * (canvas.height - 30);
        const x = index * barWidth;
        const y = canvas.height - height - 20;
        
        ctx.fillRect(x + 5, y, barWidth - 10, height);
        ctx.fillStyle = '#666';
        ctx.fillText(item.month.substring(0, 3), x + 5, canvas.height - 5);
        ctx.fillStyle = '#4f46e5';
    });
}

// ==============================================
// USERS - إدارة المستخدمين
// ==============================================

async function loadAdminUsers() {
    const container = document.getElementById('usersAdminContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto mb-4"></div><p>جاري تحميل المستخدمين...</p></div>';
    
    try {
        const token = localStorage.getItem('token');
        const search = document.getElementById('userSearchInput')?.value || '';
        const url = search ? `${API_BASE_URL}/admin/users?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/users`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            allAdminUsersData = result.users;
            displayUsersTable(result.users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p class="text-center text-red-500 py-8">فشل في تحميل المستخدمين</p>';
    }
}

function displayUsersTable(users) {
    const container = document.getElementById('usersAdminContainer');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-center py-8" style="color: var(--text-light);">لا يوجد مستخدمين</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الهاتف</th>
                        <th>الحالة</th>
                        <th>تاريخ التسجيل</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name || '-'}</td>
                            <td>${user.email || '-'}</td>
                            <td>${user.phone || '-'}</td>
                            <td>
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${user.status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </td>
                            <td>${new Date(user.createdAt).toLocaleDateString('ar-SA')}</td>
                            <td>
                                <button onclick="deleteUser('${user._id}')" class="admin-btn-danger">حذف</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف المستخدم بنجاح', 'success');
            loadAdminUsers();
        } else {
            showNotification(result.message || 'فشل في حذف المستخدم', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء الحذف', 'error');
    }
}

// البحث عن المستخدمين
function searchUsers() {
    loadAdminUsers();
}

// ==============================================
// PACKAGES - إدارة الباقات
// ==============================================

async function loadAdminPackages() {
    const container = document.getElementById('packagesAdminContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto mb-4"></div><p>جاري تحميل الباقات...</p></div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/packages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            allAdminPackagesData = result.packages;
            displayPackagesGrid(result.packages);
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        container.innerHTML = '<p class="text-center text-red-500 py-8">فشل في تحميل الباقات</p>';
    }
}

function displayPackagesGrid(packages) {
    const container = document.getElementById('packagesAdminContainer');
    if (!container) return;
    
    if (packages.length === 0) {
        container.innerHTML = '<p class="text-center py-8" style="color: var(--text-light);">لا توجد باقات</p>';
        return;
    }
    
    container.innerHTML = packages.map(pkg => `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <div class="flex justify-between items-start mb-4">
                <h4 class="text-xl font-bold" style="color: var(--text-dark);">${pkg.name || pkg.title}</h4>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    ${pkg.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </div>
            <p class="mb-4" style="color: var(--text-light);">${pkg.description || 'لا يوجد وصف'}</p>
            <p class="text-2xl font-bold mb-4" style="color: var(--primary);">${pkg.price} د.أ</p>
            <div class="mb-4">
                <p class="text-sm mb-2" style="color: var(--text-light);">المرشدين المرتبطين: ${pkg.mentors?.length || 0}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editPackage('${pkg._id}')" class="admin-btn-primary flex-1">تعديل</button>
                <button onclick="deletePackage('${pkg._id}')" class="admin-btn-danger flex-1">حذف</button>
            </div>
        </div>
    `).join('');
}

async function openAddPackageModal() {
    document.getElementById('addPackageForm').reset();
    document.getElementById('packageModalTitle').textContent = 'إضافة باقة جديدة';
    document.getElementById('editPackageId').value = '';
    await loadMentorsForPackage();
    openAdminModal('addPackageModal');
}

async function editPackage(packageId) {
    document.getElementById('packageModalTitle').textContent = 'تعديل الباقة';
    document.getElementById('editPackageId').value = packageId;
    
    await loadMentorsForPackage();
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/packages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const pkg = result.packages.find(p => p._id === packageId);
            if (pkg) {
                document.getElementById('packageName').value = pkg.name || pkg.title;
                document.getElementById('packagePrice').value = pkg.price;
                document.getElementById('packageDescription').value = pkg.description;
                document.getElementById('packageStatus').value = pkg.status;
                
                // تحديد المرشدين المرتبطين
                const mentorCheckboxes = document.querySelectorAll('input[name="packageMentors"]');
                mentorCheckboxes.forEach(checkbox => {
                    checkbox.checked = pkg.mentors?.some(m => m._id === checkbox.value || m === checkbox.value);
                });
            }
        }
    } catch (error) {
        console.error('Error loading package:', error);
    }
    
    openAdminModal('addPackageModal');
}

async function loadMentorsForPackage() {
    const container = document.getElementById('packageMentorsContainer');
    if (!container) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            container.innerHTML = result.mentors.map(mentor => `
                <label class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-700">
                    <input type="checkbox" name="packageMentors" value="${mentor._id}" class="form-checkbox">
                    <span style="color: var(--text-dark);">${mentor.name} - ${mentor.title}</span>
                </label>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
    }
}

async function savePackage(e) {
    e.preventDefault();
    
    const packageId = document.getElementById('editPackageId').value;
    const packageName = document.getElementById('packageName').value;
    const packagePrice = document.getElementById('packagePrice').value;
    const packageDescription = document.getElementById('packageDescription').value;
    const packageStatus = document.getElementById('packageStatus').value;
    
    const selectedMentors = Array.from(document.querySelectorAll('input[name="packageMentors"]:checked')).map(cb => cb.value);
    
    const formData = {
        packageName,
        packagePrice: Number(packagePrice),
        packageDescription,
        packageStatus,
        mentorIds: selectedMentors
    };
    
    try {
        const token = localStorage.getItem('token');
        const url = packageId ? `${API_BASE_URL}/admin/packages/${packageId}` : `${API_BASE_URL}/admin/packages`;
        const method = packageId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(packageId ? 'تم تحديث الباقة بنجاح' : 'تمت إضافة الباقة بنجاح', 'success');
            closeAdminModal('addPackageModal');
            loadAdminPackages();
        } else {
            showNotification(result.message || 'فشل في حفظ الباقة', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء الحفظ', 'error');
    }
}

async function deletePackage(packageId) {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/packages/${packageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف الباقة بنجاح', 'success');
            loadAdminPackages();
        } else {
            showNotification(result.message || 'فشل في حذف الباقة', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء الحذف', 'error');
    }
}

// ==============================================
// MENTORS - إدارة المرشدين
// ==============================================

async function loadAdminMentors() {
    const container = document.getElementById('mentorsAdminContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto mb-4"></div><p>جاري تحميل المرشدين...</p></div>';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            allAdminMentorsData = result.mentors;
            displayMentorsGrid(result.mentors);
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
        container.innerHTML = '<p class="text-center text-red-500 py-8">فشل في تحميل المرشدين</p>';
    }
}

function displayMentorsGrid(mentors) {
    const container = document.getElementById('mentorsAdminContainer');
    if (!container) return;
    
    if (mentors.length === 0) {
        container.innerHTML = '<p class="text-center py-8" style="color: var(--text-light);">لا يوجد مرشدين</p>';
        return;
    }
    
    container.innerHTML = mentors.map(mentor => `
        <div class="border rounded-lg p-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <div class="flex items-center gap-4 mb-4">
                <img src="${mentor.avatar || 'https://placehold.co/80x80/4338ca/fff?text=' + mentor.name.charAt(0)}" 
                     alt="${mentor.name}" 
                     class="w-16 h-16 rounded-full">
                <div class="flex-1">
                    <h4 class="text-xl font-bold" style="color: var(--text-dark);">${mentor.name}</h4>
                    <p style="color: var(--text-light);">${mentor.title || 'مرشد'}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${mentor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    ${mentor.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            </div>
            <div class="mb-4 space-y-2">
                <p class="text-sm"><strong style="color: var(--text-dark);">التخصص:</strong> <span style="color: var(--text-light);">${mentor.specialty || '-'}</span></p>
                <p class="text-sm"><strong style="color: var(--text-dark);">الخبرة:</strong> <span style="color: var(--text-light);">${mentor.experience || 0} سنة</span></p>
                <p class="text-sm"><strong style="color: var(--text-dark);">البريد:</strong> <span style="color: var(--text-light);">${mentor.email || '-'}</span></p>
                ${mentor.bio ? `<p class="text-sm" style="color: var(--text-light);">${mentor.bio.substring(0, 100)}${mentor.bio.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <div class="flex gap-2">
                <button onclick="editMentor('${mentor._id}')" class="admin-btn-primary flex-1">تعديل</button>
                <button onclick="deleteMentor('${mentor._id}')" class="admin-btn-danger flex-1">حذف</button>
            </div>
        </div>
    `).join('');
}

async function openAddMentorModal() {
    document.getElementById('addMentorForm').reset();
    document.getElementById('mentorModalTitle').textContent = 'إضافة مرشد جديد';
    document.getElementById('editMentorId').value = '';
    openAdminModal('addMentorModal');
}

async function editMentor(mentorId) {
    document.getElementById('mentorModalTitle').textContent = 'تعديل بيانات المرشد';
    document.getElementById('editMentorId').value = mentorId;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const mentor = result.mentors.find(m => m._id === mentorId);
            if (mentor) {
                document.getElementById('mentorName').value = mentor.name;
                document.getElementById('mentorTitle').value = mentor.title;
                document.getElementById('mentorEmail').value = mentor.email;
                document.getElementById('mentorAvatar').value = mentor.avatar || '';
                document.getElementById('mentorExperience').value = mentor.experience || 0;
                document.getElementById('mentorSpecialty').value = mentor.specialty || '';
                document.getElementById('mentorBio').value = mentor.bio || '';
                document.getElementById('mentorStatus').value = mentor.status;
            }
        }
    } catch (error) {
        console.error('Error loading mentor:', error);
    }
    
    openAdminModal('addMentorModal');
}

async function saveMentor(e) {
    e.preventDefault();
    
    const mentorId = document.getElementById('editMentorId').value;
    const formData = {
        mentorName: document.getElementById('mentorName').value,
        mentorTitle: document.getElementById('mentorTitle').value,
        mentorEmail: document.getElementById('mentorEmail').value,
        mentorAvatar: document.getElementById('mentorAvatar').value,
        mentorExperience: Number(document.getElementById('mentorExperience').value),
        mentorSpecialty: document.getElementById('mentorSpecialty').value,
        mentorBio: document.getElementById('mentorBio').value,
        mentorStatus: document.getElementById('mentorStatus').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const url = mentorId ? `${API_BASE_URL}/admin/mentors/${mentorId}` : `${API_BASE_URL}/admin/mentors`;
        const method = mentorId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(mentorId ? 'تم تحديث المرشد بنجاح' : 'تمت إضافة المرشد بنجاح', 'success');
            closeAdminModal('addMentorModal');
            loadAdminMentors();
        } else {
            showNotification(result.message || 'فشل في حفظ المرشد', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء الحفظ', 'error');
    }
}

async function deleteMentor(mentorId) {
    if (!confirm('هل أنت متأكد من حذف هذا المرشد؟')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/mentors/${mentorId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف المرشد بنجاح', 'success');
            loadAdminMentors();
        } else {
            showNotification(result.message || 'فشل في حذف المرشد', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء الحذف', 'error');
    }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
}

function getOrderStatusClass(status) {
    const classMap = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
}

function openAdminModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeAdminModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Export functions to window
if (typeof window !== 'undefined') {
    window.loadDashboardStats = loadDashboardStats;
    window.loadAdminUsers = loadAdminUsers;
    window.searchUsers = searchUsers;
    window.deleteUser = deleteUser;
    window.loadAdminPackages = loadAdminPackages;
    window.openAddPackageModal = openAddPackageModal;
    window.editPackage = editPackage;
    window.savePackage = savePackage;
    window.deletePackage = deletePackage;
    window.loadAdminMentors = loadAdminMentors;
    window.openAddMentorModal = openAddMentorModal;
    window.editMentor = editMentor;
    window.saveMentor = saveMentor;
    window.deleteMentor = deleteMentor;
    window.openAdminModal = openAdminModal;
    window.closeAdminModal = closeAdminModal;
}

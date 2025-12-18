// إدارة الجلسات في لوحة التحكم

// فتح نافذة إضافة جلسة جديدة
async function openAddSessionModal() {
    document.getElementById('addSessionForm').reset();
    document.getElementById('sessionModalTitle').textContent = 'إضافة جلسة جديدة';
    document.getElementById('sessionFormSubmitBtn').textContent = 'إضافة الجلسة';
    document.getElementById('editSessionId').value = '';

    await populateSessionModalDropdowns();
    openAdminModal('addSessionModal');
}

// فتح نافذة تعديل جلسة
async function editSession(sessionId) {
    document.getElementById('addSessionForm').reset();
    document.getElementById('sessionModalTitle').textContent = 'تعديل بيانات الجلسة';
    document.getElementById('sessionFormSubmitBtn').textContent = 'حفظ التعديلات';
    document.getElementById('editSessionId').value = sessionId;
    
    await populateSessionModalDropdowns();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if(result.success) {
            const session = result.session;
            document.getElementById('sessionTitle').value = session.title || '';
            document.getElementById('sessionUser').value = session.user._id;
            document.getElementById('sessionUserPhone').value = session.user.phone || '';
            document.getElementById('sessionMentor').value = session.mentor._id;
            
            const date = new Date(session.scheduledDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            document.getElementById('sessionDate').value = date.toISOString().slice(0,16);
            
            document.getElementById('sessionDuration').value = session.duration || 60;
            document.getElementById('sessionPrice').value = session.price || 0;
            document.getElementById('sessionStatus').value = session.status;
        }
    } catch(error) {
        console.error("Failed to fetch session details:", error);
        showNotification('فشل في تحميل بيانات الجلسة', 'error');
    }

    openAdminModal('addSessionModal');
}

// ملء القوائم المنسدلة بالمستخدمين والمرشدين
async function populateSessionModalDropdowns() {
    const token = localStorage.getItem('token');
    const userSelect = document.getElementById('sessionUser');
    const mentorSelect = document.getElementById('sessionMentor');
    
    userSelect.innerHTML = '<option value="">جاري التحميل...</option>';
    mentorSelect.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        // جلب المستخدمين
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersResult = await usersRes.json();
        
        if(usersResult.success) {
            allAdminUsersData = usersResult.users;
            userSelect.innerHTML = '<option value="">-- اختر مستخدم --</option>';
            userSelect.innerHTML += allAdminUsersData.map(u => 
                `<option value="${u._id}">${u.name} (${u.email})</option>`
            ).join('');
        }

        // جلب المرشدين
        const mentorsRes = await fetch(`${API_BASE_URL}/admin/mentors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const mentorsResult = await mentorsRes.json();
        
        if(mentorsResult.success) {
            mentorSelect.innerHTML = '<option value="">-- اختر مرشد --</option>';
            mentorSelect.innerHTML += mentorsResult.mentors.map(m => 
                `<option value="${m._id}">${m.name} - ${m.title || 'مرشد'}</option>`
            ).join('');
        }
    } catch(error) {
        console.error("Failed to populate session modal dropdowns:", error);
        userSelect.innerHTML = '<option value="">فشل تحميل المستخدمين</option>';
        mentorSelect.innerHTML = '<option value="">فشل تحميل المرشدين</option>';
    }
}

// حفظ الجلسة (إضافة أو تعديل)
async function saveSession(e) {
    e.preventDefault();
    
    const sessionId = document.getElementById('editSessionId').value;
    const formData = new FormData(e.target);
    
    const sessionData = {
        title: formData.get('sessionTitle'),
        userId: formData.get('sessionUser'),
        mentorId: formData.get('sessionMentor'),
        scheduledDate: formData.get('sessionDate'),
        duration: parseInt(formData.get('sessionDuration')),
        price: parseFloat(formData.get('sessionPrice')),
        status: formData.get('sessionStatus')
    };

    // التحقق من البيانات
    if (!sessionData.userId) {
        showNotification('يرجى اختيار المستخدم', 'error');
        return;
    }
    
    if (!sessionData.mentorId) {
        showNotification('يرجى اختيار المرشد', 'error');
        return;
    }
    
    if (!sessionData.scheduledDate) {
        showNotification('يرجى تحديد تاريخ ووقت الجلسة', 'error');
        return;
    }

    const submitBtn = document.getElementById('sessionFormSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الحفظ...';

    try {
        const token = localStorage.getItem('token');
        const url = sessionId 
            ? `${API_BASE_URL}/sessions/${sessionId}` 
            : `${API_BASE_URL}/sessions`;
        const method = sessionId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(
                sessionId ? 'تم تحديث الجلسة بنجاح' : 'تم إنشاء الجلسة بنجاح وإرسال إشعار للطالب', 
                'success'
            );
            closeAdminModal('addSessionModal');
            loadAdminSessions();
        } else {
            showNotification(result.message || 'فشل في حفظ الجلسة', 'error');
        }
    } catch (error) {
        console.error('Error saving session:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = sessionId ? 'حفظ التعديلات' : 'إضافة الجلسة';
    }
}

// تحميل الجلسات في لوحة التحكم
async function loadAdminSessions() {
    const container = document.getElementById('sessionsAdminContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto mb-4"></div><p>جاري تحميل الجلسات...</p></div>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.sessions.length > 0) {
            container.innerHTML = '';
            
            result.sessions.forEach(session => {
                const card = createSessionCard(session);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p style="color: var(--text-light);">لا توجد جلسات لعرضها</p>
                    <button onclick="openAddSessionModal()" class="btn-primary mt-4">إضافة جلسة جديدة</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
        container.innerHTML = '<p class="text-center text-red-500 py-8">فشل في تحميل الجلسات</p>';
    }
}

// إنشاء بطاقة جلسة
function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    
    const sessionDate = new Date(session.scheduledDate);
    const formattedDate = sessionDate.toLocaleDateString('ar-SA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = sessionDate.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const statusOptions = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
    const statusDropdown = `
        <select class="admin-table-select" onchange="updateSessionStatus(this, '${session._id}')">
            ${statusOptions.map(s => 
                `<option value="${s}" ${session.status === s ? 'selected' : ''}>${getSessionStatusText(s)}</option>`
            ).join('')}
        </select>
    `;
    
    card.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div class="mb-2 md:mb-0">
                <h4 class="font-bold text-lg" style="color: var(--text-dark);">
                    ${session.title || 'جلسة إرشادية'}
                </h4>
                <p class="text-sm" style="color: var(--text-light);">
                    مع: ${session.user ? session.user.name : '<em>مستخدم محذوف</em>'}
                </p>
            </div>
            <div class="text-right">
                ${statusDropdown}
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <p class="text-sm" style="color: var(--text-light);">المرشد:</p>
                <p class="font-medium" style="color: var(--text-dark);">
                    ${session.mentor ? session.mentor.name : '<em>مرشد محذوف</em>'}
                </p>
            </div>
            <div>
                <p class="text-sm" style="color: var(--text-light);">التاريخ والوقت:</p>
                <p class="font-medium" style="color: var(--text-dark);">
                    ${formattedDate}<br>${formattedTime}
                </p>
            </div>
            <div>
                <p class="text-sm" style="color: var(--text-light);">المدة:</p>
                <p class="font-medium" style="color: var(--text-dark);">${session.duration || 60} دقيقة</p>
            </div>
            <div>
                <p class="text-sm" style="color: var(--text-light);">المبلغ:</p>
                <p class="font-medium" style="color: var(--text-dark);">${session.price || 0} دينار أردني</p>
            </div>
        </div>
        
        <div class="flex gap-2 mt-4 flex-wrap">
            <button class="btn-secondary" onclick="editSession('${session._id}')">
                <i class="fas fa-edit"></i> تعديل
            </button>
            <button class="btn-primary" onclick="sendSessionReminder('${session._id}')">
                <i class="fas fa-bell"></i> إرسال تذكير
            </button>
            <button class="btn-danger" onclick="deleteSession('${session._id}')">
                <i class="fas fa-trash"></i> حذف
            </button>
        </div>
    `;
    
    return card;
}

// تحديث حالة الجلسة
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
            showNotification(result.message || 'فشل تحديث الحالة', 'error');
            loadAdminSessions(); // إعادة تحميل لإرجاع الحالة السابقة
        }
    } catch (error) {
        console.error('Error updating session status:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
        loadAdminSessions();
    }
}

// إرسال تذكير بالجلسة
async function sendSessionReminder(sessionId) {
    if (!confirm('هل تريد إرسال تذكير للطالب بهذه الجلسة؟')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reminder`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم إرسال التذكير بنجاح', 'success');
        } else {
            showNotification(result.message || 'فشل إرسال التذكير', 'error');
        }
    } catch (error) {
        console.error('Error sending reminder:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// حذف جلسة
async function deleteSession(sessionId) {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف الجلسة بنجاح', 'success');
            loadAdminSessions();
        } else {
            showNotification(result.message || 'فشل حذف الجلسة', 'error');
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// ترجمة حالات الجلسة
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

// تفعيل النموذج عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const sessionForm = document.getElementById('addSessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', saveSession);
    }
    
    // تحديث رقم الهاتف تلقائياً عند اختيار المستخدم
    const userSelect = document.getElementById('sessionUser');
    if (userSelect) {
        userSelect.addEventListener('change', function(e) {
            const selectedUserId = e.target.value;
            const phoneInput = document.getElementById('sessionUserPhone');
            const selectedUser = allAdminUsersData.find(user => user._id === selectedUserId);
            
            if (selectedUser && selectedUser.phone) {
                phoneInput.value = selectedUser.phone;
            } else {
                phoneInput.value = '';
            }
        });
    }
});

// تصدير الدوال للاستخدام العام
if (typeof window !== 'undefined') {
    window.openAddSessionModal = openAddSessionModal;
    window.editSession = editSession;
    window.saveSession = saveSession;
    window.loadAdminSessions = loadAdminSessions;
    window.updateSessionStatus = updateSessionStatus;
    window.sendSessionReminder = sendSessionReminder;
    window.deleteSession = deleteSession;
    window.getSessionStatusText = getSessionStatusText;
}

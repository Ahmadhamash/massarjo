// إدارة الطلبات في لوحة التحكم

// تحميل جميع الطلبات
async function loadAdminOrders() {
    const container = document.getElementById('ordersAdminContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto mb-4"></div><p>جاري تحميل الطلبات...</p></div>';

    try {
        const token = localStorage.getItem('token');
        // 🔁 كان: /admin/orders
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.orders.length > 0) {
            container.innerHTML = '';
            
            result.orders.forEach(order => {
                const card = createOrderCard(order);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <p style="color: var(--text-light);">لا توجد طلبات لعرضها</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p class="text-center text-red-500 py-8">فشل في تحميل الطلبات</p>';
    }
}

// إنشاء بطاقة طلب
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'border rounded-lg p-4 mb-4 hover:shadow-lg transition-all';
    card.style.cssText = 'background: var(--card-bg); border-color: var(--border-color);';
    
    const createdDate = new Date(order.createdAt);
    const formattedDate = createdDate.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = createdDate.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];
    const statusDropdown = `
        <select class="admin-table-select" onchange="updateOrderStatus(this, '${order._id}')">
            ${statusOptions.map(s => 
                `<option value="${s}" ${order.status === s ? 'selected' : ''}>${getOrderStatusText(s)}</option>`
            ).join('')}
        </select>
    `;
    
    card.innerHTML = `
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                    <h4 class="font-bold text-xl" style="color: var(--text-dark);">
                        ${order.package?.name || order.packageName || 'باقة غير محددة'}
                    </h4>
                    <span class="px-3 py-1 rounded-full text-sm font-bold" style="background: rgba(79, 70, 229, 0.1); color: var(--primary);">
                        ${order.package?.price || order.packagePrice || order.totalAmount || 0} دينار أردني
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <p style="color: var(--text-light);">👤 الاسم:</p>
                        <p class="font-medium" style="color: var(--text-dark);">${order.fullName || order.customerInfo?.name || order.user?.name || 'غير متوفر'}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light);">📧 البريد:</p>
                        <p class="font-medium" style="color: var(--text-dark);">${order.email || order.customerInfo?.email || order.user?.email || 'غير متوفر'}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light);">📱 الهاتف:</p>
                        <p class="font-medium" style="color: var(--text-dark);">${order.phone || order.customerInfo?.phone || order.user?.phone || 'غير متوفر'}</p>
                    </div>
                    <div>
                        <p style="color: var(--text-light);">👨‍🏫 المرشد:</p>
                        <p class="font-medium" style="color: var(--text-dark);">${order.mentor?.name || order.mentorName || 'لم يتم التحديد'}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col gap-2 lg:items-end">
                <div class="text-sm" style="color: var(--text-light);">
                    📅 ${formattedDate} - ${formattedTime}
                </div>
                ${statusDropdown}
            </div>
        </div>
        
        <div class="border-t pt-4 mt-4" style="border-color: var(--border-color);">
            <button onclick="toggleOrderDetails('${order._id}')" class="text-primary font-medium text-sm hover:underline mb-3">
                <i class="fas fa-chevron-down" id="chevron-${order._id}"></i>
                عرض التفاصيل الكاملة
            </button>
            
            <div id="order-details-${order._id}" class="hidden mt-4">
                ${order.hollandResult ? `
                    <div class="mb-4 p-4 rounded-lg" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);">
                        <h5 class="font-bold mb-3 text-lg" style="color: var(--text-dark);">
                            <i class="fas fa-brain ml-2 text-green-500"></i>نتيجة مقياس هولاند
                        </h5>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                                <p style="color: var(--text-light);">الرمز:</p>
                                <p class="font-bold text-base" style="color: var(--text-dark);">${order.hollandResult.primaryType}${order.hollandResult.secondaryType}</p>
                            </div>
                            <div>
                                <p style="color: var(--text-light);">النوع الأساسي:</p>
                                <p class="font-bold" style="color: var(--text-dark);">${getHollandTypeName(order.hollandResult.primaryType)}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- باقي التفاصيل كما هي ... (لم أغيرها) -->

                <div class="flex gap-2 mt-4 flex-wrap">
                    <button class="btn-primary" onclick="createSessionFromOrder('${order._id}')">
                        <i class="fas fa-calendar-plus"></i> إنشاء جلسة
                    </button>
                    <button class="btn-secondary" onclick="contactCustomer('${order.phone}', '${order.email}')">
                        <i class="fas fa-phone"></i> التواصل مع العميل
                    </button>
                    <button class="btn-danger" onclick="deleteOrder('${order._id}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// ... (كل الدوال المساعدة كما هي بدون تغيير: getHollandTypeName, toggleOrderDetails, contactCustomer, إلخ)

// ✅ أهم تعديل هنا: تحديث حالة الطلب
async function updateOrderStatus(selectElement, orderId) {
    const newStatus = selectElement.value;
    
    try {
        const token = localStorage.getItem('token');
        // كان: /admin/orders/${orderId}/status
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
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
            showNotification(result.message || 'فشل تحديث الحالة', 'error');
            loadAdminOrders();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
        loadAdminOrders();
    }
}

// ✅ جلب طلب واحد عند إنشاء جلسة
async function createSessionFromOrder(orderId) {
    try {
        const token = localStorage.getItem('token');
        // كان: /admin/orders/${orderId}
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const order = result.order;
            
            await openAddSessionModal();
            
            setTimeout(() => {
                if (order.user) {
                    document.getElementById('sessionUser').value = order.user._id || order.userId;
                }
                if (order.mentor) {
                    document.getElementById('sessionMentor').value = order.mentor._id || order.mentorId;
                }
                document.getElementById('sessionTitle').value = `جلسة ${order.packageName}`;
                document.getElementById('sessionPrice').value = order.packagePrice || 0;
                
                showNotification('تم ملء بيانات الجلسة من الطلب، يرجى تحديد التاريخ والوقت', 'info');
            }, 500);
        }
    } catch (error) {
        console.error('Error creating session from order:', error);
        showNotification('خطأ في إنشاء الجلسة', 'error');
    }
}

// ✅ حذف الطلب (اختياري – يعتمد على وجود راوت في الباك إند)
async function deleteOrder(orderId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
        const token = localStorage.getItem('token');
        // كان: /admin/orders/${orderId}
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حذف الطلب بنجاح', 'success');
            loadAdminOrders();
        } else {
            showNotification(result.message || 'فشل حذف الطلب', 'error');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('خطأ في الاتصال بالخادم', 'error');
    }
}

// في النهاية يبقى التصدير كما هو:
if (typeof window !== 'undefined') {
    window.loadAdminOrders = loadAdminOrders;
    window.updateOrderStatus = updateOrderStatus;
    window.toggleOrderDetails = toggleOrderDetails;
    window.createSessionFromOrder = createSessionFromOrder;
    window.contactCustomer = contactCustomer;
    window.deleteOrder = deleteOrder;
}

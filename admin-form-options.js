// إدارة خيارات نموذج الحجز

let formOptionsData = {};

// ==============================================
// تحميل خيارات النموذج
// ==============================================

async function loadFormOptionsManagement() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/form-options/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            formOptionsData = result.formOptions;
            displayFormOptions();
        }
    } catch (error) {
        console.error('Error loading form options:', error);
        showNotification('فشل في تحميل خيارات النموذج', 'error');
    }
}

function displayFormOptions() {
    const container = document.getElementById('formOptionsContainer');
    if (!container) return;
    
    const fields = [
        { key: 'stepMajor', name: 'التخصص/المجال الحالي' },
        { key: 'stepCurrentLevel', name: 'المستوى الدراسي الحالي' },
        { key: 'stepTimeline', name: 'الإطار الزمني' },
        { key: 'stepPreferredTime', name: 'الوقت المفضل للجلسة' },
        { key: 'stepSessionType', name: 'طريقة الجلسة المفضلة' }
    ];
    
    container.innerHTML = fields.map(field => {
        const fieldData = formOptionsData[field.key] || { label: field.name, options: [] };
        return generateFieldEditor(field.key, field.name, fieldData);
    }).join('');
}

function generateFieldEditor(fieldKey, fieldName, fieldData) {
    return `
        <div class="border rounded-lg p-6 mb-6" style="background: var(--card-bg); border-color: var(--border-color);">
            <h3 class="text-xl font-bold mb-4" style="color: var(--text-dark);">${fieldName}</h3>
            
            <div class="mb-4">
                <label class="block mb-2 font-medium" style="color: var(--text-dark);">عنوان الحقل</label>
                <input type="text" id="${fieldKey}Label" value="${fieldData.label || fieldName}" class="w-full p-3 rounded-lg border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between items-center mb-3">
                    <label class="font-medium" style="color: var(--text-dark);">الخيارات</label>
                    <button onclick="addFormOption('${fieldKey}')" class="admin-btn-primary text-sm">+ إضافة خيار</button>
                </div>
                
                <div id="${fieldKey}Options" class="space-y-2">
                    ${(fieldData.options || []).map((option, index) => `
                        <div class="flex gap-2 items-center">
                            <input type="text" data-field="${fieldKey}" data-index="${index}" data-type="value" value="${option.value || ''}" placeholder="القيمة (value)" class="flex-1 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                            <input type="text" data-field="${fieldKey}" data-index="${index}" data-type="label" value="${option.label || ''}" placeholder="النص المعروض (label)" class="flex-1 p-2 rounded border" style="background: var(--background); border-color: var(--border-color); color: var(--text-dark);">
                            <button onclick="removeFormOption('${fieldKey}', ${index})" class="text-red-500 hover:text-red-700 px-3 py-2">×</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button onclick="saveFormFieldOptions('${fieldKey}')" class="admin-btn-primary">حفظ التغييرات</button>
        </div>
    `;
}

function addFormOption(fieldKey) {
    if (!formOptionsData[fieldKey]) {
        formOptionsData[fieldKey] = { options: [] };
    }
    
    formOptionsData[fieldKey].options.push({
        value: '',
        label: '',
        order: formOptionsData[fieldKey].options.length
    });
    
    displayFormOptions();
}

function removeFormOption(fieldKey, index) {
    if (!confirm('هل أنت متأكد من حذف هذا الخيار؟')) return;
    
    if (formOptionsData[fieldKey] && formOptionsData[fieldKey].options) {
        formOptionsData[fieldKey].options.splice(index, 1);
        displayFormOptions();
    }
}

async function saveFormFieldOptions(fieldKey) {
    const label = document.getElementById(`${fieldKey}Label`).value;
    const optionInputs = document.querySelectorAll(`[data-field="${fieldKey}"]`);
    
    const options = [];
    const optionsMap = new Map();
    
    optionInputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        const type = input.dataset.type;
        
        if (!optionsMap.has(index)) {
            optionsMap.set(index, { value: '', label: '', order: index });
        }
        
        optionsMap.get(index)[type] = input.value;
    });
    
    optionsMap.forEach((option, index) => {
        if (option.value && option.label) {
            options.push(option);
        }
    });
    
    const fieldData = {
        label,
        options
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/form-options/${fieldKey}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fieldData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حفظ الخيارات بنجاح', 'success');
            loadFormOptionsManagement();
        } else {
            showNotification(result.message || 'فشل في حفظ الخيارات', 'error');
        }
    } catch (error) {
        console.error('Error saving form options:', error);
        showNotification('حدث خطأ أثناء الحفظ', 'error');
    }
}

// Export functions to window
if (typeof window !== 'undefined') {
    window.loadFormOptionsManagement = loadFormOptionsManagement;
    window.addFormOption = addFormOption;
    window.removeFormOption = removeFormOption;
    window.saveFormFieldOptions = saveFormFieldOptions;
}

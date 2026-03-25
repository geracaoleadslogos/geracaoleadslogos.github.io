document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStep = 0;
    const totalSteps = 9; // Steps 1 to 9 (Step 0 is contextual, Step 10 is success)
    
    // DOM Elements
    const steps = document.querySelectorAll('.step');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const startBtn = document.getElementById('start-btn');
    const progressWrapper = document.getElementById('progress-wrapper');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // Forms and Inputs
    const regionOtherCheck = document.getElementById('regionOtherCheck');
    const regionOtherContainer = document.getElementById('regionOtherContainer');
    
    const hasPlanYes = document.getElementById('hasPlanYes');
    const hasPlanNo = document.getElementById('hasPlanNo');
    const currentOperatorContainer = document.getElementById('currentOperatorContainer');

    const networkYesRadio = document.getElementById('networkYesRadio');
    const networkNoRadio = document.getElementById('networkNoRadio');
    const networkTextContainer = document.getElementById('networkTextContainer');

    const phoneInput = document.getElementById('phone');

    // Initialize
    initMasks();
    updateView();

    // Age Limits Live Constraints
    const ageInputs = document.querySelectorAll('#step-3 input[type="number"]');
    ageInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (parseInt(input.value) < 0 || !input.value) input.value = 0;
            updateAgeLimits();
        });
    });

    // Event Listeners for Navigation
    startBtn.addEventListener('click', () => {
        if (validateStep0()) {
            currentStep = 1;
            updateView();
        }
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                currentStep++;
                updateView();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            updateView();
        });
    });

    // Conditional Fields Logic
    regionOtherCheck.addEventListener('change', (e) => {
        regionOtherContainer.style.display = e.target.checked ? 'block' : 'none';
        if(e.target.checked) document.getElementById('regionOtherText').focus();
    });

    hasPlanYes.addEventListener('change', () => {
        currentOperatorContainer.style.display = 'block';
    });
    
    hasPlanNo.addEventListener('change', () => {
        currentOperatorContainer.style.display = 'none';
    });

    networkYesRadio.addEventListener('change', () => {
        networkTextContainer.style.display = 'block';
        document.getElementById('networkText').focus();
    });
    
    networkNoRadio.addEventListener('change', () => {
        networkTextContainer.style.display = 'none';
    });


    // Core Functions
    function updateView() {
        if (currentStep === 4) {
            const vidas = document.querySelector('input[name="livesCount"]:checked')?.value;
            const premiumOps = document.querySelectorAll('.op-premium');
            premiumOps.forEach(op => {
                if (vidas === '2') {
                    op.style.display = 'none';
                    const radio = op.querySelector('input');
                    if (radio && radio.checked) {
                        document.querySelector('input[name="preferredOperator"][value="Sem preferência"]').checked = true;
                    }
                } else {
                    op.style.display = 'block';
                }
            });
        }
        
        if (currentStep === 3) {
            updateAgeLimits();
        }

        // Toggle Steps Visibility
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Toggle Progress Bar Visiblity and Content
        if (currentStep > 0 && currentStep < 9) {
            progressWrapper.classList.remove('hidden');
            const percent = ((currentStep) / 8) * 100;
            progressFill.style.width = `${percent}%`;
            progressText.innerText = `Passo ${currentStep} de 8`;
        } else {
            progressWrapper.classList.add('hidden');
        }

        if (currentStep === 9) {
            simulateLoading();
        }

        // Scroll to top when changing steps smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function simulateLoading() {
        let progress = 0;
        const barFill = document.getElementById('loading-bar-fill');
        const percentageText = document.getElementById('loading-percentage');
        barFill.style.width = '0%';
        percentageText.innerText = '0%';
        
        const opName = document.querySelector('input[name="preferredOperator"]:checked')?.value || 'Sem preferência';
        let displayOpName = opName === 'Sem preferência' ? 'Buscando as melhores opções' : `Avaliando propostas da ${opName}...`;
        
        const opDomains = {
            'Amil': 'amil.com.br',
            'SulAmérica': 'sulamerica.com.br',
            'Porto': 'porto.com.br',
            'Klini': 'klini.com.br',
            'Leve Saúde': 'levesaude.com.br',
            'Bradesco': 'banco.bradesco',
            'MedSênior': 'medsenior.com.br',
            'Hapvida': 'hapvida.com.br',
            'Prevent Senior': 'preventsenior.com.br'
        };

        let logoHtml = '<i class="fa-solid fa-building-shield" style="font-size: 3rem;"></i>';
        
        if (opName !== 'Sem preferência') {
            const domain = opDomains[opName] || 'beneficios.com';
            const googleIconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${opName}&background=2563eb&color=fff&size=120`;
            
            logoHtml = `<img src="${googleIconUrl}" onerror="this.onerror=null; this.src='${fallbackAvatar}';" alt="${opName} Logo" style="max-height: 80px; max-width: 160px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">`;
        }
        
        document.getElementById('loading-op-name').innerText = displayOpName;
        document.getElementById('loading-logo').innerHTML = logoHtml;
        
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                barFill.style.width = '100%';
                percentageText.innerText = '100%';
                setTimeout(() => { window.submitForm(); }, 400);
            } else {
                barFill.style.width = progress + '%';
                percentageText.innerText = progress + '%';
            }
        }, 300);
    }

    function updateAgeLimits() {
        const selectedLives = document.querySelector('input[name="livesCount"]:checked')?.value;
        const inputs = document.querySelectorAll('#step-3 input[type="number"]');
        const distributeSpan = document.getElementById('lives-distributed');
        const targetSpan = document.getElementById('lives-total-target');
        const counterHeader = document.getElementById('lives-counter');
        
        if (!distributeSpan) return;

        let targetMax = Infinity;
        let isExact = false;
        
        if (selectedLives === '2') { targetMax = 2; isExact = true; targetSpan.innerText = '2'; }
        else if (selectedLives === '3') { targetMax = 3; isExact = true; targetSpan.innerText = '3'; }
        else if (selectedLives === '4') { targetMax = 4; isExact = true; targetSpan.innerText = '4'; }
        else if (selectedLives === '5-7') { targetMax = 7; isExact = false; targetSpan.innerText = '5 a 7'; }
        else if (selectedLives === '8-10') { targetMax = 10; isExact = false; targetSpan.innerText = '8 a 10'; }
        else if (selectedLives === '11+') { targetMax = Infinity; isExact = false; targetSpan.innerText = '11+'; }
        else { counterHeader.classList.add('hidden'); return; }
        
        counterHeader.classList.remove('hidden');

        // calculate current sum
        let total = 0;
        inputs.forEach(input => total += parseInt(input.value) || 0);
        
        distributeSpan.innerText = total;

        // update visual colors
        if (isExact && total === targetMax) {
            counterHeader.style.color = 'var(--primary)'; // success color
        } else if (!isExact && selectedLives === '5-7' && total >= 5 && total <= 7) {
            counterHeader.style.color = 'var(--primary)';
        } else if (!isExact && selectedLives === '8-10' && total >= 8 && total <= 10) {
            counterHeader.style.color = 'var(--primary)';
        } else if (!isExact && selectedLives === '11+' && total >= 11) {
            counterHeader.style.color = 'var(--primary)';
        } else {
            counterHeader.style.color = 'var(--text-main)'; // default info
        }

        // Apply strict DOM max limits
        if (targetMax !== Infinity) {
            inputs.forEach(input => {
                const currentVal = parseInt(input.value) || 0;
                let remaining = targetMax - total;
                let allowedMax = currentVal + (remaining > 0 ? remaining : 0);
                
                // Set HTML attribute so user can't spin box above this
                input.max = allowedMax;
                
                // If the user pasted a number higher than max, crop it and recount!
                if (currentVal > allowedMax) {
                    input.value = allowedMax;
                    total = 0;
                    inputs.forEach(i => total += parseInt(i.value) || 0);
                    distributeSpan.innerText = total;
                }
            });
        }
    }

    // Input Masks
    function initMasks() {
        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            if (!x[2]) { e.target.value = x[1]; return; }
            e.target.value = !x[3] ? '(' + x[1] + ') ' + x[2] : '(' + x[1] + ') ' + x[2] + '-' + x[3];
        });
    }

    // Validation
    function validateStep0() {
        const requiredIds = ['fullName', 'email', 'phone', 'cnpjType'];
        let isValid = true;
        
        requiredIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                el.classList.add('error');
                el.style.borderColor = 'var(--text-main)'; // Reset
                setTimeout(() => el.style.borderColor = '#EF4444', 10);
                isValid = false;
            } else {
                el.style.borderColor = 'var(--border)';
            }
        });

        // Validate regions
        const regions = document.querySelectorAll('input[name="regions"]:checked');
        const regionLabel = document.querySelector('.checkbox-grid').parentElement.querySelector('label');
        if (regions.length === 0) {
            regionLabel.style.color = '#EF4444';
            isValid = false;
        } else {
            regionLabel.style.color = 'var(--text-main)';
        }

        if(!isValid) alert('Por favor, preencha todos os campos obrigatórios.');
        return isValid;
    }

    function validateCurrentStep() {
        // Step 1: Lives count
        if (currentStep === 1) {
            const selected = document.querySelector('input[name="livesCount"]:checked');
            if (!selected) {
                alert('Por favor, selecione a quantidade de vidas.');
                return false;
            }
        }

        // Step 2: Plano Atual
        if (currentStep === 2) {
             const selected = document.querySelector('input[name="hasPlan"]:checked');
             if (!selected) {
                 alert('Por favor, informe se já possui plano de saúde.');
                 return false;
             }
             if (selected.value === 'Sim') {
                 const opSelected = document.querySelector('input[name="currentOperator"]:checked');
                 if (!opSelected) {
                     alert('Por favor, selecione qual é a sua operadora atual.');
                     return false;
                 }
             }
        }
        
        // Step 3: Age ranges
        if (currentStep === 3) {
            const inputs = document.querySelectorAll('#step-3 input[type="number"]');
            let total = 0;
            inputs.forEach(input => total += parseInt(input.value) || 0);
            
            const selectedLives = document.querySelector('input[name="livesCount"]:checked')?.value;
            const errorElement = document.getElementById('ageError');
            let errorMessage = '';

            if (total === 0) {
                errorMessage = 'Por favor, insira pelo menos uma vida.';
            } else if (selectedLives) {
                if (selectedLives === '2' && total !== 2) {
                    errorMessage = 'O total inserido deve ser exatamente 2 vidas.';
                } else if (selectedLives === '3' && total !== 3) {
                    errorMessage = 'O total inserido deve ser exatamente 3 vidas.';
                } else if (selectedLives === '4' && total !== 4) {
                    errorMessage = 'O total inserido deve ser exatamente 4 vidas.';
                } else if (selectedLives === '5-7' && (total < 5 || total > 7)) {
                    errorMessage = 'O total inserido deve estar entre 5 e 7 vidas.';
                } else if (selectedLives === '8-10' && (total < 8 || total > 10)) {
                    errorMessage = 'O total inserido deve estar entre 8 e 10 vidas.';
                } else if (selectedLives === '11+' && total < 11) {
                    errorMessage = 'Para 11+ vidas, o total inserido deve ser no mínimo 11.';
                }
            }
            
            if (errorMessage !== '') {
                errorElement.innerText = errorMessage;
                errorElement.classList.remove('hidden');
                return false;
            } else {
                errorElement.classList.add('hidden');
            }
        }
        
        // Step 4: Operadora de preferência (Optional)

        // Step 5: Coverage
        if (currentStep === 5) {
            const selected = document.querySelector('input[name="coverage"]:checked');
            if (!selected) {
                alert('Por favor, selecione a cobertura desejada.');
                return false;
            }
        }

        // Step 6: Area
        if (currentStep === 6) {
             const selected = document.querySelector('input[name="area"]:checked');
             if (!selected) {
                alert('Por favor, selecione a abrangência geográfica.');
                return false;
            }
        }

        // Step 7: Accommodation
        if (currentStep === 7) {
             const selected = document.querySelector('input[name="accommodation"]:checked');
             if (!selected) {
                alert('Por favor, selecione o tipo de acomodação.');
                return false;
            }
        }

        // Step 8: Network
        if (currentStep === 8) {
             const selected = document.querySelector('input[name="networkPref"]:checked');
             if (!selected) {
                alert('Por favor, informe a preferência por rede credenciada.');
                return false;
            }
            if (selected.value === 'Sim' && !document.getElementById('networkText').value.trim()) {
                alert('Por favor, especifique os hospitais/laboratórios.');
                return false;
            }
        }

        return true;
    }

});

// Global form submit logic
window.submitForm = function() {
    // Collect Data
    const data = {
        contato: document.getElementById('fullName').value,
        vidas: document.querySelector('input[name="livesCount"]:checked')?.value || '',
        temPlano: document.querySelector('input[name="hasPlan"]:checked')?.value || 'Não',
        operadoraAtual: document.querySelector('input[name="hasPlan"]:checked')?.value === 'Sim' ? (document.querySelector('input[name="currentOperator"]:checked')?.value || 'Não especificada') : 'N/A',
        operadoraPreferencia: document.querySelector('input[name="preferredOperator"]:checked')?.value || 'Sem preferência',
        cobertura: document.querySelector('input[name="coverage"]:checked')?.value || '',
        abrangencia: document.querySelector('input[name="area"]:checked')?.value || ''
    };

    // Generate Recap
    const recapContainer = document.getElementById('recap-content');
    recapContainer.innerHTML = `
        <div class="recap-item"><span>Solicitante</span> <span>${data.contato}</span></div>
        <div class="recap-item"><span>Total de Vidas</span> <span>${data.vidas}</span></div>
        <div class="recap-item"><span>Plano Atual</span> <span>${data.temPlano}</span></div>
        ${data.temPlano === 'Sim' ? '<div class="recap-item"><span>Operadora Atual</span> <span>' + data.operadoraAtual + '</span></div>' : ''}
        <div class="recap-item"><span>Preferência</span> <span>${data.operadoraPreferencia}</span></div>
        <div class="recap-item"><span>Cobertura</span> <span>${data.cobertura}</span></div>
        <div class="recap-item"><span>Abrangência</span> <span>${data.abrangencia}</span></div>
    `;

    // Show Success Page
    const steps = document.querySelectorAll('.step');
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById('step-success').classList.add('active');
    
    document.getElementById('progress-wrapper').classList.add('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

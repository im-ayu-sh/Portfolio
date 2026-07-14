document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('animus-contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = document.getElementById('btn-text');
    const feedback = document.getElementById('contact-feedback');

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Enter Loading State
            const originalText = btnText.innerText;
            btnText.innerText = 'ENCRYPTING...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            feedback.classList.add('hidden');

            // 2. Gather Data
            const formData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value
            };

            try {
                // 3. Send to Cloudflare Proxy Function
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                // 4. Handle Theme-Aware Feedback UI
                if (response.ok) {
                    feedback.innerHTML = '<span style="color: var(--ac1-blue);">[ TRANSMISSION SUCCESSFUL ]</span>';
                    form.reset();
                } else {
                    feedback.innerHTML = '<span style="color: var(--ac1-red);">[ TRANSMISSION FAILED - RETRY ]</span>';
                }
            } catch (error) {
                feedback.innerHTML = '<span style="color: var(--ac1-red);">[ CONNECTION LOST ]</span>';
            } finally {
                // 5. Restore Button State
                btnText.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                
                feedback.classList.remove('hidden');
                
                // Hide feedback after 5 seconds
                setTimeout(() => {
                    feedback.classList.add('hidden');
                }, 5000);
            }
        });
    }
});
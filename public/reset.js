document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('resetButton');
    const messageDiv = document.getElementById('message');

    resetButton.addEventListener('click', async () => {
        // First confirmation
        const firstConfirm = confirm('Are you sure you want to reset all expenses?');
        if (!firstConfirm) return;

        // Second confirmation
        const secondConfirm = confirm('⚠️ This action is IRREVERSIBLE. Are you absolutely sure?');
        if (!secondConfirm) return;

        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            messageDiv.style.display = 'block';

            if (response.ok) {
                messageDiv.className = 'alert alert-success mt-3';
                messageDiv.textContent = '✅ All expenses have been reset successfully';
                // Disable the reset button after successful reset
                resetButton.disabled = true;
            } else {
                const data = await response.json();
                messageDiv.className = 'alert alert-danger mt-3';
                messageDiv.textContent = '❌ Error: ' + (data.error || 'Failed to reset expenses');
            }
        } catch (error) {
            messageDiv.style.display = 'block';
            messageDiv.className = 'alert alert-danger mt-3';
            messageDiv.textContent = '❌ Error: Failed to connect to server';
        }
    });
}); 
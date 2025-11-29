class PaymentGateway {
    constructor() {
        this.init();
    }

    init() {
        this.populateYearDropdown();
        this.setupEventListeners();
        this.loadTransactions();
    }

    populateYearDropdown() {
        const yearSelect = document.getElementById('expiryYear');
        const currentYear = new Date().getFullYear();

        for (let i = 0; i < 15; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('paymentForm');
        const cardNumberInput = document.getElementById('cardNumber');
        const cvvInput = document.getElementById('cvv');

        form.addEventListener('submit', (e) => this.handlePayment(e));
        cardNumberInput.addEventListener('input', (e) => this.formatCardNumber(e));
        cardNumberInput.addEventListener('input', (e) => this.detectCardType(e.target.value));
        cvvInput.addEventListener('input', (e) => this.formatCVV(e));
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let matches = value.match(/\d{4,16}/g);
        let match = matches ? matches[0] : '';
        let parts = [];

        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            e.target.value = parts.join(' ');
        } else {
            e.target.value = value;
        }
    }

    detectCardType(cardNumber) {
        const cardTypeElement = document.getElementById('cardType');
        const cleanNumber = cardNumber.replace(/\s/g, '');

        let cardType = '';

        if (/^4/.test(cleanNumber)) {
            cardType = 'Visa';
        } else if (/^5[1-5]/.test(cleanNumber)) {
            cardType = 'Mastercard';
        } else if (/^3[47]/.test(cleanNumber)) {
            cardType = 'Amex';
        } else if (/^6(?:011|5)/.test(cleanNumber)) {
            cardType = 'Discover';
        }

        cardTypeElement.textContent = cardType;
    }

    formatCVV(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    async handlePayment(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const paymentData = {
            card_number: formData.get('card_number').replace(/\s/g, ''),
            card_holder: formData.get('card_holder'),
            expiry_month: formData.get('expiry_month'),
            expiry_year: formData.get('expiry_year'),
            cvv: formData.get('cvv'),
            amount: formData.get('amount')
        };

        if (!this.validateForm(paymentData)) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('php/process_payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            this.showResponse(result);

            if (result.success) {
                this.resetForm();
                this.loadTransactions();
            }

        } catch (error) {
            this.showResponse({
                success: false,
                message: 'Network error: Please try again later.'
            });
        } finally {
            this.showLoading(false);
        }
    }

    validateForm(data) {
        // Card number validation (Luhn algorithm will be checked on server)
        if (!data.card_number || data.card_number.length < 13) {
            this.showError('Please enter a valid card number');
            return false;
        }

        // Expiry date validation
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (parseInt(data.expiry_year) < currentYear ||
            (parseInt(data.expiry_year) === currentYear && parseInt(data.expiry_month) < currentMonth)) {
            this.showError('Card has expired');
            return false;
        }

        // CVV validation
        if (!data.cvv || data.cvv.length < 3) {
            this.showError('Please enter a valid CVV');
            return false;
        }

        // Amount validation
        if (!data.amount || parseFloat(data.amount) <= 0) {
            this.showError('Please enter a valid amount');
            return false;
        }

        return true;
    }

    showLoading(show) {
        const button = document.getElementById('payButton');
        const buttonText = button.querySelector('.button-text');
        const spinner = document.getElementById('spinner');

        if (show) {
            button.disabled = true;
            buttonText.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }

    showResponse(result) {
        const responseElement = document.getElementById('responseMessage');

        responseElement.textContent = result.message;
        responseElement.className = `response-message ${result.success ? 'success' : 'error'}`;
        responseElement.classList.remove('hidden');

        setTimeout(() => {
            responseElement.classList.add('hidden');
        }, 5000);
    }

    showError(message) {
        this.showResponse({
            success: false,
            message: message
        });
    }

    resetForm() {
        document.getElementById('paymentForm').reset();
        document.getElementById('cardType').textContent = '';
    }

    async loadTransactions() {
        try {
            const response = await fetch('php/get_transactions.php');
            const transactions = await response.json();

            const transactionList = document.getElementById('transactionList');
            transactionList.innerHTML = '';

            if (transactions.length === 0) {
                transactionList.innerHTML = '<p>No transactions found</p>';
                return;
            }

            transactions.forEach(transaction => {
                const transactionElement = this.createTransactionElement(transaction);
                transactionList.appendChild(transactionElement);
            });

        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    createTransactionElement(transaction) {
        const div = document.createElement('div');
        div.className = 'transaction-item';

        div.innerHTML = `
            <div>
                <div class="transaction-id">${transaction.transaction_id}</div>
                <div>${transaction.card_holder} - ****${transaction.card_number.slice(-4)}</div>
            </div>
            <div>
                <div class="transaction-amount">$${parseFloat(transaction.amount).toFixed(2)}</div>
                <div class="transaction-status ${transaction.status}">${transaction.status}</div>
            </div>
        `;

        return div;
    }
}

// Initialize the payment gateway when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PaymentGateway();
});
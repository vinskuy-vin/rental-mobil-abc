document.addEventListener('DOMContentLoaded', function() {
    // Data mobil
    // test
    const cars = [
        {
            id: 1,
            name: 'Toyota Avanza',
            price: 500000,
            image: '../asset/avanza.jpg'
        },
        {
            id: 2,
            name: 'Toyota Kijang Innova',
            price: 700000,
            image: '../asset/inova.jpeg'
        },
        {
            id: 3,
            name: 'Honda HRV',
            price: 600000,
            image: '../asset/hrv.jpg'
        },
        {
            id: 4,
            name: 'Daihatsu Sigra',
            price: 450000,
            image: '../asset/sigra.jpeg'
        }
    ];

    const carsContainer = document.getElementById('carsContainer');
    const rentalForm = document.getElementById('rentalForm');
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const summaryContent = document.getElementById('summaryContent');
    const orderHistory = document.getElementById('orderHistory');
    const customerNameInput = document.getElementById('customerName');

    // Render daftar mobil
    function renderCars() {
        carsContainer.innerHTML = '';
        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.innerHTML = `
                <img src="${car.image}" alt="${car.name}">
                <h3>${car.name}</h3>
                <p class="price">Rp ${car.price.toLocaleString('id-ID')} / hari</p>
                <div class="form-group">
                    <label>
                        <input type="checkbox" class="car-checkbox" data-id="${car.id}"> Pilih Mobil
                    </label>
                </div>
                <div class="form-group">
                    <label for="startDate-${car.id}">Tanggal Mulai Sewa:</label>
                    <input type="date" id="startDate-${car.id}" class="start-date" data-id="${car.id}">
                </div>
                <div class="form-group">
                    <label for="duration-${car.id}">Durasi Sewa (hari):</label>
                    <input type="number" id="duration-${car.id}" class="duration" data-id="${car.id}" min="1" value="1">
                </div>
            `;
            carsContainer.appendChild(carCard);
        });
    }

    // Hitung total sewa
    function calculateTotal() {
        const customerName = customerNameInput.value.trim();
        if (!customerName) {
            alert('Silakan masukkan nama pelanggan terlebih dahulu.');
            return;
        }

        const checkboxes = document.querySelectorAll('.car-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Silakan pilih minimal satu mobil.');
            return;
        }

        let summaryHTML = `<p>Pelanggan: <strong>${customerName}</strong></p>`;
        summaryHTML += '<h3>Detail Sewa:</h3><ul>';
        
        let total = 0;
        let valid = true;

        checkboxes.forEach(checkbox => {
            const carId = parseInt(checkbox.dataset.id);
            const car = cars.find(c => c.id === carId);
            const startDate = document.getElementById(`startDate-${carId}`).value;
            const duration = parseInt(document.getElementById(`duration-${carId}`).value);

            if (!startDate) {
                alert(`Silakan isi tanggal mulai sewa untuk ${car.name}.`);
                valid = false;
                return;
            }

            if (isNaN(duration) || duration < 1) {
                alert(`Durasi sewa untuk ${car.name} tidak valid.`);
                valid = false;
                return;
            }

            const subtotal = car.price * duration;
            total += subtotal;

            summaryHTML += `
                <li>
                    <strong>${car.name}</strong><br>
                    Tanggal: ${formatDate(startDate)}<br>
                    Durasi: ${duration} hari<br>
                    Subtotal: Rp ${subtotal.toLocaleString('id-ID')}
                </li>
            `;
        });

        if (!valid) return;

        summaryHTML += '</ul>';
        summaryHTML += `<h3>Total Sewa: Rp ${total.toLocaleString('id-ID')}</h3>`;
        
        summaryContent.innerHTML = summaryHTML;
        saveBtn.disabled = false;
    }

    // Format tanggal
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    // Simpan pemesanan
    function saveOrder() {
        const customerName = customerNameInput.value.trim();
        const checkboxes = document.querySelectorAll('.car-checkbox:checked');
        
        if (checkboxes.length === 0 || !customerName) {
            alert('Data tidak lengkap. Silakan hitung total terlebih dahulu.');
            return;
        }

        const order = {
            customerName,
            timestamp: new Date().toISOString(),
            items: [],
            total: 0
        };

        checkboxes.forEach(checkbox => {
            const carId = parseInt(checkbox.dataset.id);
            const car = cars.find(c => c.id === carId);
            const startDate = document.getElementById(`startDate-${carId}`).value;
            const duration = parseInt(document.getElementById(`duration-${carId}`).value);

            const subtotal = car.price * duration;
            order.total += subtotal;

            order.items.push({
                carId,
                carName: car.name,
                startDate,
                duration,
                subtotal
            });
        });

        // Simpan ke localStorage
        let orders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
        orders.push(order);
        localStorage.setItem('rentalOrders', JSON.stringify(orders));

        // Tampilkan pesan sukses
        alert('Pemesanan berhasil disimpan!');
        
        // Reset form
        rentalForm.reset();
        summaryContent.innerHTML = '';
        saveBtn.disabled = true;
        
        // Perbarui riwayat
        renderOrderHistory();
    }

    // Render riwayat pemesanan
    function renderOrderHistory() {
        const orders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
        orderHistory.innerHTML = '';

        if (orders.length === 0) {
            orderHistory.innerHTML = '<p>Belum ada riwayat pemesanan.</p>';
            return;
        }

        orders.forEach((order, index) => {
            const orderDate = new Date(order.timestamp);
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            
            let itemsHTML = '<ul>';
            order.items.forEach(item => {
                itemsHTML += `
                    <li>
                        ${item.carName} - ${formatDate(item.startDate)} (${item.duration} hari): 
                        Rp ${item.subtotal.toLocaleString('id-ID')}
                    </li>
                `;
            });
            itemsHTML += '</ul>';

            orderItem.innerHTML = `
                <h3>Pemesanan #${index + 1}</h3>
                <p><strong>Pelanggan:</strong> ${order.customerName}</p>
                <p><strong>Waktu Pemesanan:</strong> ${orderDate.toLocaleString('id-ID')}</p>
                <p><strong>Detail Mobil:</strong></p>
                ${itemsHTML}
                <p><strong>Total:</strong> Rp ${order.total.toLocaleString('id-ID')}</p>
                <button class="delete-btn" data-index="${index}">Hapus Pemesanan</button>
            `;
            
            orderHistory.appendChild(orderItem);
        });

        // Tambahkan event listener untuk tombol hapus
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteOrder(index);
            });
        });
    }

    // Hapus pemesanan
    function deleteOrder(index) {
        if (confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) {
            let orders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
            orders.splice(index, 1);
            localStorage.setItem('rentalOrders', JSON.stringify(orders));
            renderOrderHistory();
        }
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculateTotal);
    saveBtn.addEventListener('click', saveOrder);

    // Set minimum date untuk input tanggal (hari ini)
    const today = new Date().toISOString().split('T')[0];
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('start-date')) {
            e.target.min = today;
        }
    });

    // Inisialisasi
    renderCars();
    renderOrderHistory();
});
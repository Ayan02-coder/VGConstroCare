	
		document.getElementById('contactForm').addEventListener('submit', async function (e) {
			e.preventDefault();
			const formData = new FormData(this);

			const data = {
				name: formData.get('name'),
				email: formData.get('email'),
				subject: formData.get('subject'),
				message: formData.get('message'),
			};

			try {
				const response = await fetch('http://localhost:3000/api/contact', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});

			const result = await response.json();
			alert(result.message);
			this.reset();
			} catch (error) {
			alert('Failed to send message');
			console.error(error);
			}
		});
	
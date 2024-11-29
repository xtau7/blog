document.addEventListener('DOMContentLoaded', function() {
    console.log('El blog está listo!');

    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('comment-form').style.display = 'none';
    }

    // Obtener comentarios
    fetch('/comments')
        .then(response => response.json())
        .then(comments => {
            const commentsSection = document.getElementById('comments');
            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `<p><strong>${comment.username}:</strong> ${comment.content}</p>`;
                commentsSection.insertBefore(commentDiv, commentsSection.lastElementChild);
            });
        });

    // Manejar el envío de comentarios
    document.getElementById('comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const textarea = this.querySelector('textarea');
        if (textarea.value.trim()) {
            fetch('/comments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    content: textarea.value
                })
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error al guardar el comentario');
                }
            }).then(() => {
                const newComment = document.createElement('div');
                newComment.classList.add('comment');
                newComment.innerHTML = `<p><strong>Nuevo Usuario:</strong> ${textarea.value}</p>`;
                document.getElementById('comments').insertBefore(newComment, this);
                textarea.value = '';
            }).catch(err => {
                console.error(err);
            });
        }
    });

    // Manejar el registro de usuarios
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
            alert('Usuario registrado');
        } else {
            alert('Error al registrar usuario');
        }
    });

    // Manejar el inicio de sesión
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            alert('Inicio de sesión exitoso');
            document.getElementById('comment-form').style.display = 'block';
        } else {
            alert('Credenciales inválidas');
        }
    });
});

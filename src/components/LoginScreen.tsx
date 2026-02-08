import { useState } from 'react';

interface LoginScreenProps {
    onLogin: (type: 'admin' | 'student', email: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");

    const handleGoogleMock = () => {
        // Simulated Google Login
        onLogin('student', studentEmail || 'aluno@gmail.com', studentName || 'Explorador');
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'url("https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover'
        }}>
            <div className="game-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
                <h1 style={{ marginBottom: '10px' }}>A JORNADA DA FÉ</h1>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '30px', fontWeight: 'bold' }}>ESCOLHA SEU PORTAL</p>

                {!isAdminMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>ENTRADA DO EXPLORADOR</h2>
                        <input
                            type="text"
                            placeholder="SEU NOME"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="white-card"
                            style={{ width: '100%', border: 'none', padding: '12px', fontSize: '1rem', color: '#333' }}
                        />
                        <input
                            type="email"
                            placeholder="SEU EMAIL"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            className="white-card"
                            style={{ width: '100%', border: 'none', padding: '12px', fontSize: '1rem', color: '#333' }}
                        />
                        <button className="btn-3d" style={{ background: '#fff', color: '#333' }} onClick={handleGoogleMock}>
                            <img src="https://www.google.com/favicon.ico" style={{ width: '20px' }} />
                            LOGAR COM GOOGLE (MOCK)
                        </button>
                        <div style={{ margin: '10px 0', fontSize: '0.8rem', opacity: 0.6 }}>OU</div>
                        <button className="btn-3d btn-secondary" onClick={() => setIsAdminMode(true)}>
                            PAINEL DO PROFESSOR
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>ACERVO DO MESTRE</h2>
                        {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</div>}
                        <input
                            type="text"
                            placeholder="USUÁRIO"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            className="white-card"
                            style={{ width: '100%', border: 'none', padding: '12px', fontSize: '1rem', color: '#333' }}
                        />
                        <input
                            type="password"
                            placeholder="SENHA"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            className="white-card"
                            style={{ width: '100%', border: 'none', padding: '12px', fontSize: '1rem', color: '#333' }}
                        />
                        <button type="submit" className="btn-3d btn-secondary">ENTRAR NO PAINEL</button>
                        <button type="button" style={{ background: 'transparent', color: 'white', marginTop: '10px' }} onClick={() => setIsAdminMode(false)}>
                            VOLTAR AO LOGIN ALUNO
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;

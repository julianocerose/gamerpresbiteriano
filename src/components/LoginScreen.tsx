import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Shield, Map, Sparkles } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (type: 'admin' | 'student', email: string, name?: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [adminUser, setAdminUser] = useState("");
    const [adminPass, setAdminPass] = useState("");
    const [error, setError] = useState("");
    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            if (adminUser === "pastor" && adminPass === "fe2026") {
                onLogin('admin', 'admin@fe.com');
            } else {
                setError("Chave do Reino incorreta!");
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleGoogleMock = () => {
        setIsLoading(true);
        setTimeout(() => {
            onLogin('student', studentEmail || 'aluno@gmail.com', studentName || 'Explorador');
        }, 1200);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'url("https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&q=80&w=1920")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="game-card"
                style={{
                    width: '90%',
                    maxWidth: '450px',
                    textAlign: 'center',
                    padding: '50px 40px',
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    borderRadius: '24px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        left: 'calc(50% - 40px)',
                        width: '80px',
                        height: '80px',
                        background: 'var(--p-gold)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px var(--p-gold)',
                        zIndex: 2
                    }}
                >
                    <Sparkles size={40} color="black" />
                </motion.div>

                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '5px',
                    letterSpacing: '2px',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
                }}>
                    JORNADA DA FÉ
                </h1>
                <p style={{
                    opacity: 0.6,
                    fontSize: '0.8rem',
                    marginBottom: '40px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '3px'
                }}>
                    Acampamento 2026
                </p>

                <AnimatePresence mode="wait">
                    {!isAdminMode ? (
                        <motion.div
                            key="student"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.8, marginLeft: '5px' }}>IDENTIDADE DO EXPLORADOR</label>
                                <input
                                    type="text"
                                    placeholder="DIGITE SEU NOME"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    autoComplete="off"
                                    style={{
                                        width: '100%',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '16px',
                                        fontSize: '1rem',
                                        color: '#fff',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        marginTop: '5px',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            </div>

                            <div style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.8, marginLeft: '5px' }}>EMAIL DE ACESSO</label>
                                <input
                                    type="email"
                                    placeholder="SEU@EMAIL.COM"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    autoComplete="off"
                                    style={{
                                        width: '100%',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        padding: '16px',
                                        fontSize: '1rem',
                                        color: '#fff',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        marginTop: '5px'
                                    }}
                                />
                            </div>

                            <button
                                className="btn-3d"
                                style={{
                                    background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
                                    color: '#1a1a1a',
                                    height: '60px',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                                onClick={handleGoogleMock}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={20} /></motion.div>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        INICIAR JORNADA
                                    </>
                                )}
                            </button>

                            <button
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    opacity: 0.4,
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    marginTop: '20px'
                                }}
                                onClick={() => setIsAdminMode(true)}
                            >
                                SOU PROFESSOR / MESTRE
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="admin"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleAdminLogin}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            <h2 style={{ fontSize: '1rem', color: 'var(--p-gold)', letterSpacing: '2px' }}>ACERVO DO MESTRE</h2>
                            {error && <div style={{ color: '#ff6b6b', fontSize: '0.8rem', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

                            <input
                                type="text"
                                placeholder="USUÁRIO"
                                value={adminUser}
                                onChange={(e) => setAdminUser(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '16px',
                                    fontSize: '1rem',
                                    color: '#fff',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px'
                                }}
                            />
                            <input
                                type="password"
                                placeholder="SENHA SAGRADA"
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '16px',
                                    fontSize: '1rem',
                                    color: '#fff',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px'
                                }}
                            />

                            <button type="submit" className="btn-3d btn-secondary" style={{ height: '60px' }} disabled={isLoading}>
                                {isLoading ? "ABRINDO PORTAIS..." : "ENTRAR NO PAINEL"}
                            </button>

                            <button
                                type="button"
                                style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                onClick={() => setIsAdminMode(false)}
                            >
                                VOLTAR AO LOGIN DO ALUNO
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Floating Elements Decoration */}
            <div style={{ position: 'absolute', top: '10%', left: '15%', opacity: 0.1 }}>
                <Map size={120} color="white" />
            </div>
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.1 }}>
                <Shield size={100} color="white" />
            </div>
        </div>
    );
};

export default LoginScreen;

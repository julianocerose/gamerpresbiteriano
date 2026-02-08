import { useState, useEffect } from 'react'
import TrailScreen from './components/TrailScreen'
import AdminPanel from './components/AdminPanel'
import LoginScreen from './components/LoginScreen'
import MissionBoard from './components/MissionBoard'

export type ScoreType = {
    estudo: number;
    louvor: number;
    atividades: number;
}

export type Mission = {
    id: string;
    title: string;
    description: string;
    rewardXP: number;
    targetLessonId: string;
}

export type Proof = {
    id: string;
    studentId: string;
    missionId: string;
    photo: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
}

export type Lesson = {
    id: string;
    title: string;
    order: number;
    requiredXP: number;
}

export type Student = {
    id: string;
    name: string;
    email: string;
    photo: string | null;
    score: ScoreType;
    status: 'pending' | 'active';
    completedMissions: string[];
}

function App() {
    const [user, setUser] = useState<{ type: 'admin' | 'student'; email: string } | null>(() => {
        const saved = localStorage.getItem('jornada_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [view, setView] = useState<'trail' | 'admin' | 'missions'>(() => {
        return (localStorage.getItem('jornada_view') as any) || 'trail';
    });

    const [students, setStudents] = useState<Student[]>(() => {
        const saved = localStorage.getItem('jornada_students');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Juliano Admin', email: 'admin@fe.com', photo: null, score: { estudo: 50, louvor: 50, atividades: 50 }, status: 'active', completedMissions: [] },
        ];
    });

    const [lessons, setLessons] = useState<Lesson[]>(() => {
        const saved = localStorage.getItem('jornada_lessons');
        return saved ? JSON.parse(saved) : [
            { id: 'L1', title: 'Abertura', order: 1, requiredXP: 0 },
            { id: 'L2', title: 'O Chamado', order: 2, requiredXP: 50 },
        ];
    });

    const [missions, setMissions] = useState<Mission[]>(() => {
        const saved = localStorage.getItem('jornada_missions');
        return saved ? JSON.parse(saved) : [
            { id: 'M1', title: 'Primeiro Passo', description: 'Leia João 3:16 e envie uma foto.', rewardXP: 10, targetLessonId: 'L1' },
        ];
    });

    const [proofs, setProofs] = useState<Proof[]>(() => {
        const saved = localStorage.getItem('jornada_proofs');
        return saved ? JSON.parse(saved) : [];
    });

    // PERSISTENCE
    useEffect(() => {
        localStorage.setItem('jornada_user', JSON.stringify(user));
        localStorage.setItem('jornada_view', view);
        localStorage.setItem('jornada_students', JSON.stringify(students));
        localStorage.setItem('jornada_lessons', JSON.stringify(lessons));
        localStorage.setItem('jornada_missions', JSON.stringify(missions));
        localStorage.setItem('jornada_proofs', JSON.stringify(proofs));
    }, [user, view, students, lessons, missions, proofs]);

    const handleLogin = (type: 'admin' | 'student', email: string, name?: string) => {
        const exists = students.find(s => s.email === email);
        if (!exists && type === 'student') {
            const newStudent: Student = {
                id: Math.random().toString(36).substr(2, 9),
                name: name || 'Novo Explorador',
                email,
                photo: null,
                score: { estudo: 0, louvor: 0, atividades: 0 },
                status: 'pending',
                completedMissions: []
            };
            setStudents(prev => [...prev, newStudent]);
        }
        setUser({ type, email });
        setView(type === 'admin' ? 'admin' : 'trail');
    };

    const addStudent = (newStudent: Omit<Student, 'id' | 'score' | 'completedMissions'>) => {
        const student: Student = {
            id: Math.random().toString(36).substr(2, 9),
            name: newStudent.name,
            email: newStudent.email,
            photo: newStudent.photo || null,
            score: { estudo: 0, louvor: 0, atividades: 0 },
            status: 'active',
            completedMissions: []
        };
        setStudents(prev => [...prev, student]);
    };

    const updateStudent = (id: string, updates: Partial<Student>) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteStudent = (id: string) => {
        setStudents(prev => prev.filter(s => s.id !== id));
    };


    const handleCompleteMission = (missionId: string, studentId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!mission) return;

        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return {
                    ...s,
                    score: {
                        ...s.score,
                        atividades: s.score.atividades + mission.rewardXP
                    }
                };
            }
            return s;
        }));
    };

    const addProof = (proof: Proof) => {
        setProofs(prev => [...prev, proof]);
    };

    const approveProof = (proofId: string) => {
        const proof = proofs.find(p => p.id === proofId);
        if (!proof) return;

        setProofs(prev => prev.map(p => p.id === proofId ? { ...p, status: 'approved' } : p));

        const mission = missions.find(m => m.id === proof.missionId);
        if (mission) {
            setStudents(prev => prev.map(s => s.id === proof.studentId ? {
                ...s,
                score: { ...s.score, atividades: s.score.atividades + mission.rewardXP },
                completedMissions: [...s.completedMissions, mission.id]
            } : s));
        }
    };

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const currentStudent = students.find(s => s.email === user.email);

    // Pending user check
    if (user.type === 'student' && currentStudent?.status === 'pending') {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', background: 'var(--background)' }}>
                <div className="game-card" style={{ maxWidth: '400px' }}>
                    <h2 style={{ color: 'var(--accent)' }}>SANTUÁRIO DE ESPERA ⏳</h2>
                    <p style={{ margin: '20px 0' }}>Sua inscrição está sendo analisada pelos mestres. Assim que aprovado, sua jornada começará!</p>
                    <button className="btn-3d btn-secondary" onClick={() => setUser(null)}>SAIR</button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="game-hud-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }}>🛡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 style={{ fontSize: '1.1rem', color: 'var(--primary)', letterSpacing: '1px' }}>A JORNADA DA FÉ</h1>
                        <span style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: '900' }}>DOMÍNIO: {user.type.toUpperCase()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {user.type === 'admin' ? (
                        <button className="btn-3d btn-secondary" style={{ padding: '8px 15px', fontSize: '0.8rem' }} onClick={() => setView(view === 'admin' ? 'trail' : 'admin')}>
                            {view === 'admin' ? '🧭 VER MAPA' : '🏰 PAINEL ADMIN'}
                        </button>
                    ) : (
                        <button className="btn-3d" style={{ padding: '8px 15px', fontSize: '0.8rem' }} onClick={() => setView(view === 'missions' ? 'trail' : 'missions')}>
                            {view === 'missions' ? '🗺️ VOLTAR TRILHA' : '📜 MISSÕES ATIVAS'}
                        </button>
                    )}
                    <button className="btn-3d" style={{ background: '#444', padding: '8px 12px' }} onClick={() => setUser(null)}>🚪</button>
                </div>
            </header>

            <main style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
                {view === 'trail' && <TrailScreen
                    students={students.filter(s => s.status === 'active')}
                    lessons={lessons}
                    missions={missions}
                    user={user}
                    onCompleteMission={handleCompleteMission}
                />}
                {view === 'admin' && <AdminPanel
                    students={students}
                    addStudent={addStudent}
                    updateStudent={updateStudent}
                    deleteStudent={deleteStudent}
                    lessons={lessons}
                    setLessons={setLessons}
                    missions={missions}
                    setMissions={setMissions}
                    proofs={proofs}
                    approveProof={approveProof}
                />}
                {view === 'missions' && currentStudent && <MissionBoard
                    student={currentStudent}
                    missions={missions}
                    proofs={proofs}
                    onAddProof={addProof}
                />}
            </main>
        </div>
    )
}

export default App

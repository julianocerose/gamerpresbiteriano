import { useState, useEffect } from 'react'
import TrailScreen from './components/TrailScreen'
import AdminPanel from './components/AdminPanel'
import LoginScreen from './components/LoginScreen'
import MissionBoard from './components/MissionBoard'
import { supabase } from './supabase'

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

    const [students, setStudents] = useState<Student[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [proofs, setProofs] = useState<Proof[]>([]);

    // FETCH INITIAL DATA & SETUP REALTIME
    useEffect(() => {
        const fetchData = async () => {
            const { data: st } = await supabase.from('students').select('*');
            if (st) setStudents(st.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                photo: s.photo,
                score: { estudo: s.score_estudo, louvor: s.score_louvor, atividades: s.score_atividades },
                status: s.status,
                completedMissions: s.completed_missions || []
            })));

            const { data: ls } = await supabase.from('lessons').select('*').order('order', { ascending: true });
            if (ls) setLessons(ls.map(l => ({
                id: l.id,
                title: l.title,
                order: l.order,
                requiredXP: l.required_xp
            })));

            const { data: ms } = await supabase.from('missions').select('*');
            if (ms) setMissions(ms.map(m => ({
                id: m.id,
                title: m.title,
                description: m.description,
                rewardXP: m.reward_xp,
                targetLessonId: m.target_lesson_id
            })));

            const { data: pr } = await supabase.from('proofs').select('*');
            if (pr) setProofs(pr.map(p => ({
                id: p.id,
                studentId: p.student_id,
                missionId: p.mission_id,
                photo: p.photo,
                status: p.status,
                timestamp: new Date(p.timestamp).getTime()
            })));
        };

        fetchData();

        // REALTIME SUBSCRIPTIONS
        const studentsSub = supabase.channel('students_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchData())
            .subscribe();

        const lessonsSub = supabase.channel('lessons_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => fetchData())
            .subscribe();

        const missionsSub = supabase.channel('missions_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => fetchData())
            .subscribe();

        const proofsSub = supabase.channel('proofs_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(studentsSub);
            supabase.removeChannel(lessonsSub);
            supabase.removeChannel(missionsSub);
            supabase.removeChannel(proofsSub);
        };
    }, []);

    // PERSISTENCE (User only)
    useEffect(() => {
        localStorage.setItem('jornada_user', JSON.stringify(user));
        localStorage.setItem('jornada_view', view);
    }, [user, view]);

    const handleLogin = async (type: 'admin' | 'student', email: string, name?: string) => {
        let finalType = type;
        if (email === 'admin@fe.com' || email === 'julianocerose@gmail.com') {
            finalType = 'admin';
        }

        const { data: existing } = await supabase.from('students').select('*').eq('email', email).single();

        if (!existing && finalType === 'student') {
            await supabase.from('students').insert([{
                name: name || 'Novo Explorador',
                email,
                status: 'pending',
                score_estudo: 0,
                score_louvor: 0,
                score_atividades: 0
            }]);
        } else if (existing && (email === 'admin@fe.com' || email === 'julianocerose@gmail.com')) {
            await supabase.from('students').update({ status: 'active' }).eq('id', existing.id);
        }

        setUser({ type: finalType, email });
        setView(finalType === 'admin' ? 'admin' : 'trail');
    };

    const addStudent = async (newStudent: Omit<Student, 'id' | 'score' | 'completedMissions'>) => {
        await supabase.from('students').insert([{
            name: newStudent.name,
            email: newStudent.email,
            photo: newStudent.photo || null,
            status: 'active',
            score_estudo: 0,
            score_louvor: 0,
            score_atividades: 0
        }]);
    };

    const updateStudent = async (id: string, updates: Partial<Student>) => {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.photo) dbUpdates.photo = updates.photo;
        if (updates.score) {
            dbUpdates.score_estudo = updates.score.estudo;
            dbUpdates.score_louvor = updates.score.louvor;
            dbUpdates.score_atividades = updates.score.atividades;
        }
        if (updates.completedMissions) dbUpdates.completed_missions = updates.completedMissions;

        await supabase.from('students').update(dbUpdates).eq('id', id);
    };

    const deleteStudent = async (id: string) => {
        await supabase.from('students').delete().eq('id', id);
    };

    const handleCompleteMission = async (missionId: string, studentId: string) => {
        const student = students.find(s => s.id === studentId);
        const mission = missions.find(m => m.id === missionId);
        if (!student || !mission) return;

        await supabase.from('students').update({
            score_atividades: student.score.atividades + mission.rewardXP
        }).eq('id', studentId);
    };

    const addProof = async (proof: Proof) => {
        await supabase.from('proofs').insert([{
            student_id: proof.studentId,
            mission_id: proof.missionId,
            photo: proof.photo,
            status: 'pending'
        }]);
    };

    const approveProof = async (proofId: string) => {
        const proof = proofs.find(p => p.id === proofId);
        if (!proof) return;

        const mission = missions.find(m => m.id === proof.missionId);
        const student = students.find(s => s.id === proof.studentId);

        if (mission && student) {
            await supabase.from('students').update({
                score_atividades: student.score.atividades + mission.rewardXP,
                completed_missions: [...student.completedMissions, mission.id]
            }).eq('id', student.id);

            await supabase.from('proofs').update({ status: 'approved' }).eq('id', proofId);
        }
    };

    const updateLesson = async (id: string, updates: Partial<Lesson>) => {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.order !== undefined) dbUpdates.order = updates.order;
        if (updates.requiredXP !== undefined) dbUpdates.required_xp = updates.requiredXP;
        await supabase.from('lessons').update(dbUpdates).eq('id', id);
    };

    const deleteLesson = async (id: string) => {
        await supabase.from('lessons').delete().eq('id', id);
    };

    const addLesson = async (lesson: Lesson) => {
        await supabase.from('lessons').insert([{
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            required_xp: lesson.requiredXP
        }]);
    };

    const updateMission = async (id: string, updates: Partial<Mission>) => {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.rewardXP !== undefined) dbUpdates.reward_xp = updates.rewardXP;
        if (updates.targetLessonId) dbUpdates.target_lesson_id = updates.targetLessonId;
        await supabase.from('missions').update(dbUpdates).eq('id', id);
    };

    const deleteMission = async (id: string) => {
        await supabase.from('missions').delete().eq('id', id);
    };

    const addMission = async (mission: Mission) => {
        await supabase.from('missions').insert([{
            id: mission.id,
            title: mission.title,
            description: mission.description,
            reward_xp: mission.rewardXP,
            target_lesson_id: mission.targetLessonId
        }]);
    };

    // Final UI Logic
    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const currentStudent = students.find(s => s.email === user.email);

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
                    addLesson={addLesson}
                    updateLesson={updateLesson}
                    deleteLesson={deleteLesson}
                    missions={missions}
                    addMission={addMission}
                    updateMission={updateMission}
                    deleteMission={deleteMission}
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

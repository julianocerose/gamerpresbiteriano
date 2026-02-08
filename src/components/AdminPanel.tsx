import { useState } from 'react';
import { motion } from 'framer-motion';
import { Student, Lesson, Mission, Proof } from '../App';

interface AdminPanelProps {
    students: Student[];
    addStudent: (newStudent: any) => void;
    updateStudent: (id: string, updates: Partial<Student>) => void;
    deleteStudent: (id: string) => void;
    lessons: Lesson[];
    addLesson: (lesson: Lesson) => void;
    updateLesson: (id: string, updates: Partial<Lesson>) => void;
    deleteLesson: (id: string) => void;
    missions: Mission[];
    addMission: (mission: Mission) => void;
    updateMission: (id: string, updates: Partial<Mission>) => void;
    deleteMission: (id: string) => void;
    proofs: Proof[];
    approveProof: (id: string) => void;
}

const AdminPanel = ({
    students = [],
    addStudent,
    updateStudent,
    deleteStudent,
    lessons = [],
    addLesson,
    updateLesson,
    deleteLesson,
    missions = [],
    addMission,
    updateMission,
    deleteMission,
    proofs = [],
    approveProof
}: AdminPanelProps) => {
    const [tab, setTab] = useState<'students' | 'journey' | 'proofs'>('students');

    // Forms State
    const [newStudent, setNewStudent] = useState({ name: '', email: '', photo: '' });
    const [newLesson, setNewLesson] = useState({ title: '', xp: '50' });
    const [newMission, setNewMission] = useState({ title: '', desc: '', lessonId: '', xp: '10' });
    const [editingGrades, setEditingGrades] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, studentId?: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (studentId) {
                    updateStudent(studentId, { photo: base64String });
                } else {
                    setNewStudent(prev => ({ ...prev, photo: base64String }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const safeStudents = Array.isArray(students) ? students : [];
    const safeLessons = Array.isArray(lessons) ? lessons : [];
    const safeMissions = Array.isArray(missions) ? missions : [];
    const safeProofs = Array.isArray(proofs) ? proofs : [];

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
            <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>CENTRAL DO MESTRE</h2>
            </header>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
                <button className={`btn-3d ${tab === 'students' ? 'btn-active' : ''}`} onClick={() => setTab('students')}>👥 ALUNOS</button>
                <button className={`btn-3d ${tab === 'journey' ? 'btn-active' : ''}`} onClick={() => setTab('journey')}>🗺️ JORNADA</button>
                <button className={`btn-3d ${tab === 'proofs' ? 'btn-active' : ''}`} onClick={() => setTab('proofs')}>📸 PROVAS ({safeProofs.filter(p => p.status === 'pending').length})</button>
            </div>

            {tab === 'students' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div className="game-card" style={{ border: '2px dashed var(--p-gold)' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>+ INSCREVER NOVO ALUNO</h3>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div
                                onClick={() => document.getElementById('new-photo-input')?.click()}
                                style={{
                                    width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                                    cursor: 'pointer', overflow: 'hidden', border: '3px solid var(--p-gold)'
                                }}
                            >
                                {newStudent.photo ? <img src={newStudent.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                            </div>
                            <input
                                id="new-photo-input" type="file" accept="image/*" hidden
                                onChange={(e) => handleFileChange(e)}
                            />

                            <div style={{ flex: 1, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <input
                                    type="text" placeholder="NOME" value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white' }}
                                />
                                <input
                                    type="email" placeholder="EMAIL" value={newStudent.email}
                                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                    style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: 'white' }}
                                />
                                <button className="btn-3d" style={{ background: 'var(--primary)', color: 'white', width: '100%' }} onClick={() => {
                                    if (newStudent.name && newStudent.email) {
                                        addStudent(newStudent);
                                        setNewStudent({ name: '', email: '', photo: '' });
                                    }
                                }}>ADICIONAR EXPLORADOR</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        {safeStudents
                            .sort((a, b) => {
                                if (a.status === 'pending' && b.status !== 'pending') return -1;
                                if (a.status !== 'pending' && b.status === 'pending') return 1;
                                return (a.name || '').localeCompare(b.name || '');
                            })
                            .map(student => (
                                <div key={student?.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div className="game-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                                            <div
                                                onClick={() => document.getElementById(`photo-input-${student.id}`)?.click()}
                                                style={{
                                                    width: '50px', height: '50px', borderRadius: '50%', background: '#eee',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                                    overflow: 'hidden', border: '2px solid white', cursor: 'pointer'
                                                }}
                                            >
                                                {student?.photo ? <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                            </div>
                                            <input
                                                id={`photo-input-${student.id}`} type="file" accept="image/*" hidden
                                                onChange={(e) => handleFileChange(e, student.id)}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                                                <input
                                                    type="text"
                                                    value={student.name}
                                                    onChange={e => updateStudent(student.id, { name: e.target.value })}
                                                    style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1rem', width: '100%' }}
                                                />
                                                <input
                                                    type="email"
                                                    value={student.email}
                                                    onChange={e => updateStudent(student.id, { email: e.target.value })}
                                                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', width: '100%' }}
                                                />
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <div style={{
                                                        fontSize: '0.6rem', padding: '2px 8px', borderRadius: '10px',
                                                        background: student?.status === 'active' ? '#40c057' : '#fa5252',
                                                        display: 'inline-block', fontWeight: 'bold'
                                                    }}>
                                                        {(student?.status || 'pendente').toUpperCase()}
                                                    </div>
                                                    {student?.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStudent(student.id, { status: 'active' })}
                                                            style={{ padding: '2px 8px', borderRadius: '5px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '0.6rem', fontWeight: 'bold', cursor: 'pointer' }}
                                                        >
                                                            ✅ APROVAR
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button className="btn-3d" style={{ fontSize: '0.7rem', padding: '8px 12px' }} onClick={() => setEditingGrades(editingGrades === student.id ? null : student.id)}>
                                                📊 NOTAS
                                            </button>
                                            <div className="game-card" style={{ padding: '5px 10px', fontSize: '0.8rem', background: 'var(--p-gold)', color: 'black', fontWeight: 'bold' }}>
                                                {(student?.score?.estudo || 0) + (student?.score?.louvor || 0) + (student?.score?.atividades || 0)} XP
                                            </div>
                                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => deleteStudent(student.id)}>🗑️</button>
                                        </div>
                                    </div>

                                    {editingGrades === student.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="game-card" style={{ background: 'rgba(255,255,255,0.05)', marginTop: '-5px', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '5px' }}>ESTUDO</label>
                                                    <input
                                                        type="number" value={student.score.estudo}
                                                        onChange={e => updateStudent(student.id, { score: { ...student.score, estudo: parseInt(e.target.value) || 0 } })}
                                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '8px', borderRadius: '5px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '5px' }}>LOUVOR</label>
                                                    <input
                                                        type="number" value={student.score.louvor}
                                                        onChange={e => updateStudent(student.id, { score: { ...student.score, louvor: parseInt(e.target.value) || 0 } })}
                                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '8px', borderRadius: '5px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginBottom: '5px' }}>ATIVIDADES</label>
                                                    <input
                                                        type="number" value={student.score.atividades}
                                                        onChange={e => updateStudent(student.id, { score: { ...student.score, atividades: parseInt(e.target.value) || 0 } })}
                                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '8px', borderRadius: '5px' }}
                                                    />
                                                </div>
                                                <div style={{ gridColumn: 'span 3', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => document.getElementById(`photo-input-${student.id}`)?.click()}
                                                        className="btn-3d" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}
                                                    >
                                                        📷 ALTERAR FOTO DO ALUNO
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {tab === 'journey' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid var(--p-gold)', paddingLeft: '10px' }}>MAPA DA TRILHA (LIÇÕES)</h2>

                        <div className="game-card" style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--p-gold)' }}>
                            <h4 style={{ fontSize: '0.8rem', marginBottom: '10px', opacity: 0.8 }}>+ NOVA ETAPA NO MAPA</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text" placeholder="NOME DA LIÇÃO" value={newLesson.title}
                                    onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '12px', borderRadius: '8px' }}
                                />
                                <input
                                    type="number" placeholder="XP" value={newLesson.xp}
                                    onChange={e => setNewLesson({ ...newLesson, xp: e.target.value })}
                                    style={{ width: '80px', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '12px', borderRadius: '8px' }}
                                />
                                <button className="btn-3d" style={{ background: 'var(--primary)', color: 'white' }} onClick={() => {
                                    if (newLesson.title) {
                                        addLesson({ id: 'L' + Date.now(), title: newLesson.title, order: safeLessons.length + 1, requiredXP: parseInt(newLesson.xp) });
                                        setNewLesson({ title: '', xp: '100' });
                                    }
                                }}>+</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '10px' }}>
                            {safeLessons.sort((a, b) => a.order - b.order).map((l, i) => (
                                <div key={l?.id} className="game-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                    <div style={{ background: 'var(--p-gold)', color: 'black', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        {i + 1}
                                    </div>
                                    <input
                                        type="text" value={l.title}
                                        onChange={e => updateLesson(l.id, { title: e.target.value })}
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="number" value={l.requiredXP}
                                            onChange={e => updateLesson(l.id, { requiredXP: parseInt(e.target.value) || 0 })}
                                            style={{ width: '60px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffcc00', padding: '8px', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}
                                        />
                                        <span style={{ fontSize: '0.6rem', color: '#ffcc00' }}>XP</span>
                                    </div>
                                    <button
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                                        onClick={() => deleteLesson(l.id)}
                                    >🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.2rem', borderLeft: '4px solid #339af0', paddingLeft: '10px' }}>MISSÕES DISPONÍVEIS</h2>
                        <div className="game-card" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text" placeholder="NOME DA MISSÃO" value={newMission.title}
                                        onChange={e => setNewMission({ ...newMission, title: e.target.value })}
                                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '12px', borderRadius: '8px' }}
                                    />
                                    <input
                                        type="number" placeholder="XP" value={newMission.xp}
                                        onChange={e => setNewMission({ ...newMission, xp: e.target.value })}
                                        style={{ width: '80px', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '12px', borderRadius: '8px' }}
                                    />
                                </div>
                                <input
                                    type="text" placeholder="DESCRIÇÃO DA MISSÃO (Ex: Ler João 3:16)" value={newMission.desc}
                                    onChange={e => setNewMission({ ...newMission, desc: e.target.value })}
                                    style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '12px', borderRadius: '8px' }}
                                />
                                <select
                                    style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', padding: '12px', borderRadius: '8px' }}
                                    value={newMission.lessonId}
                                    onChange={e => setNewMission({ ...newMission, lessonId: e.target.value })}
                                >
                                    <option value="">VINCULAR À LIÇÃO...</option>
                                    {safeLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                                </select>
                                <button className="btn-3d" style={{ background: 'var(--primary)', color: 'white' }} onClick={() => {
                                    if (newMission.title) {
                                        addMission({
                                            id: 'M' + Date.now(),
                                            title: newMission.title,
                                            description: newMission.desc || 'Missão do reino',
                                            rewardXP: parseInt(newMission.xp) || 10,
                                            targetLessonId: newMission.lessonId || (safeLessons[0]?.id || '')
                                        });
                                        setNewMission({ title: '', desc: '', lessonId: '', xp: '10' });
                                    }
                                }}>CRIAR MISSÃO</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {safeMissions.map(m => {
                                    const linkedLesson = lessons.find(l => l.id === m.targetLessonId);
                                    return (
                                        <div key={m.id} className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <input
                                                    type="text" value={m.title}
                                                    onChange={e => updateMission(m.id, { title: e.target.value })}
                                                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <input
                                                        type="number" value={m.rewardXP}
                                                        onChange={e => updateMission(m.id, { rewardXP: parseInt(e.target.value) || 0 })}
                                                        style={{ width: '60px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffcc00', padding: '8px', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}
                                                    />
                                                    <span style={{ fontSize: '0.6rem', color: '#ffcc00' }}>XP</span>
                                                </div>
                                                <button
                                                    onClick={() => deleteMission(m.id)}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5, marginLeft: '10px' }}
                                                >🗑️</button>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--p-gold)', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>📍 VINCULADA A: {linkedLesson?.title || 'SEM LIÇÃO'}</span>
                                                <input
                                                    type="text"
                                                    value={m.description}
                                                    onChange={e => updateMission(m.id, { description: e.target.value })}
                                                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', textAlign: 'right', fontSize: '0.7rem' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'proofs' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', textAlign: 'center' }}>VALIDAÇÃO</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {safeProofs.filter(p => p.status === 'pending').map(proof => {
                            const student = safeStudents.find(s => s.id === proof.studentId);
                            return (
                                <div key={proof.id} className="game-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <img src={proof.photo} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                                    <p style={{ fontSize: '0.8rem' }}>De: <strong>{student?.name}</strong></p>
                                    <button className="btn-3d" style={{ background: '#40c057', color: 'white' }} onClick={() => approveProof(proof.id)}>APROVAR</button>
                                </div>
                            );
                        })}
                    </div>
                    {safeProofs.filter(p => p.status === 'pending').length === 0 && (
                        <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px' }}>✅ Sem ordens pendentes.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

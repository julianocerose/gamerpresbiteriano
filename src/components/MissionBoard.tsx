import { motion } from 'framer-motion';
import { Student, Mission, Proof } from '../App';

interface MissionBoardProps {
    student: Student;
    missions: Mission[];
    proofs: Proof[];
    onAddProof: (proof: Proof) => void;
}

const MissionBoard = ({ student, missions, proofs, onAddProof }: MissionBoardProps) => {
    const handleUploadProof = (missionId: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            onAddProof({
                id: Math.random().toString(36).substr(2, 9),
                studentId: student.id,
                missionId,
                photo: reader.result as string,
                status: 'pending',
                timestamp: Date.now()
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ padding: '30px 20px', maxWidth: '700px', margin: '0 auto', color: 'white' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(0,0,0,0.5)', fontFamily: 'var(--font-heading)' }}>📜 QUADRO DE MISSÕES</h2>
                <p style={{ opacity: 0.8, fontWeight: '900', letterSpacing: '2px' }}>SUAS TAREFAS DE HOJE</p>
            </header>

            <div style={{ display: 'grid', gap: '25px' }}>
                {missions.map(mission => {
                    const proof = proofs.find(p => p.missionId === mission.id && p.studentId === student.id);
                    const isCompleted = student.completedMissions.includes(mission.id);

                    return (
                        <motion.div
                            key={mission.id}
                            className="game-card"
                            style={{
                                border: isCompleted ? '4px solid var(--success)' : '1px solid var(--glass-border)',
                                background: isCompleted ? 'rgba(67, 160, 71, 0.15)' : 'rgba(0,0,0,0.6)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Shine effect for completed missions */}
                            {isCompleted && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }} />
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <h3 style={{ color: 'var(--accent)', fontSize: '1.4rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{mission.title}</h3>
                                <div style={{
                                    background: 'var(--primary)', padding: '5px 15px', borderRadius: '20px',
                                    fontSize: '0.8rem', fontWeight: '900', border: '2px solid white'
                                }}>
                                    +{mission.rewardXP} XP
                                </div>
                            </div>

                            <p style={{ fontSize: '1rem', marginBottom: '25px', opacity: 0.9, lineHeight: '1.6' }}>{mission.description}</p>

                            {isCompleted ? (
                                <div style={{ color: 'var(--success)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🏆</span> MISSÃO CUMPRIDA! VOCÊ É UM HERÓI.
                                </div>
                            ) : proof ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{
                                        fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', padding: '10px',
                                        borderRadius: '10px', textAlign: 'center', fontWeight: 'bold', border: '1px dashed white'
                                    }}>
                                        {proof.status === 'pending' ? '⏳ PROVA EM ANÁLISE PELO MESTRE...' : '❌ PROVA REJEITADA. REENCAMINHE.'}
                                    </div>
                                    <img src={proof.photo} style={{ width: '100%', borderRadius: '15px', maxHeight: '200px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <label className="btn-3d" style={{ width: '100%', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📷</span> ENVIAR PROVA DA TAREFA
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadProof(mission.id, file);
                                            }}
                                        />
                                    </label>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'center', fontStyle: 'italic' }}>
                                        Sua foto será validada pelo professor para liberar seu progresso no mapa.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {missions.length === 0 && (
                    <div className="game-card" style={{ textAlign: 'center', opacity: 0.6, padding: '60px' }}>
                        <span style={{ fontSize: '3rem' }}>🛡️</span>
                        <p style={{ marginTop: '15px' }}>O Santuário de Missões está em silêncio... Aguarde novas ordens do Professor!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MissionBoard;

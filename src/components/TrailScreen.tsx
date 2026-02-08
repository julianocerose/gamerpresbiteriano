import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student, Lesson, Mission } from '../App';
import MaiAAssistant from './MaiAAssistant';

interface TrailScreenProps {
    students: Student[];
    lessons: Lesson[];
    missions: Mission[];
    user: any;
    onCompleteMission: (missionId: string, studentId: string) => void;
}

const TrailScreen = ({ students, lessons, missions, user, onCompleteMission }: TrailScreenProps) => {
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
    const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
    const [rewardToast, setRewardToast] = useState<{ xp: number, show: boolean }>({ xp: 0, show: false });

    // High-Precision "Trilha Pro" mapping (45 points) provided by the user
    const pathPoints = [
        // --- TRECHO 1: ENTRADA E SUBIDA INICIAL (AJUSTADO: MAIS PARA CIMA) ---
        { x: 42.0, y: 92.0 }, { x: 39.5, y: 89.0 }, { x: 36.8, y: 86.0 },
        { x: 33.5, y: 82.0 }, { x: 31.2, y: 78.5 }, { x: 29.5, y: 75.0 },

        // --- TRECHO 2: PRIMEIRA CURVA (PARA A DIREITA) ---
        { x: 29.8, y: 72.0 }, { x: 31.5, y: 69.5 }, { x: 34.0, y: 67.0 },
        { x: 38.0, y: 65.0 }, { x: 43.0, y: 63.5 }, { x: 48.5, y: 62.2 },
        { x: 54.0, y: 61.0 }, { x: 60.0, y: 59.5 }, { x: 65.5, y: 57.8 },
        { x: 70.0, y: 55.5 }, { x: 73.5, y: 52.5 }, { x: 74.8, y: 49.0 },

        // --- TRECHO 3: RETORNO CENTRAL (SENTIDO ESQUERDA) ---
        { x: 73.2, y: 46.0 }, { x: 69.5, y: 44.0 }, { x: 65.0, y: 43.0 },
        { x: 60.0, y: 42.0 }, { x: 55.0, y: 41.5 }, { x: 50.0, y: 41.0 },
        { x: 45.0, y: 40.5 }, { x: 40.0, y: 39.8 }, { x: 35.0, y: 38.8 },
        { x: 30.5, y: 37.5 }, { x: 26.8, y: 35.5 }, { x: 24.5, y: 32.5 },

        // --- TRECHO 4: CURVA FINAL E SUBIDA AO CASTELO ---
        { x: 24.0, y: 29.0 }, { x: 25.5, y: 26.0 }, { x: 28.5, y: 23.5 },
        { x: 32.5, y: 22.0 }, { x: 37.0, y: 20.8 }, { x: 42.0, y: 19.5 },
        { x: 47.0, y: 18.0 }, { x: 52.0, y: 16.8 }, { x: 57.0, y: 15.0 },
        { x: 61.5, y: 13.0 }, { x: 64.0, y: 10.5 }, { x: 63.5, y: 8.0 },
        { x: 60.0, y: 6.0 }, { x: 55.0, y: 5.5 }, { x: 51.5, y: 4.0 }
    ];

    const getPosition = (totalXP: number) => {
        if (sortedLessons.length === 0) return pathPoints[0] || { x: 50, y: 50 };

        const numLessons = sortedLessons.length;
        const totalPathSegments = pathPoints.length - 1;

        // Encontrar em qual segmento de lição o aluno está
        // Segmento i é o espaço entre Lição i e Lição i+1
        let lessonIdx = -1;
        for (let i = 0; i < numLessons - 1; i++) {
            if (totalXP < sortedLessons[i + 1].requiredXP) {
                lessonIdx = i;
                break;
            }
        }

        // Determinar a posição no caminho (index no pathPoints) para cada lição
        // Lição 1 (index 0) fica em 0%
        // Lição N (index numLessons-1) fica em (numLessons-1)/numLessons * totalPathSegments
        // O Castelo fica em 1.0 * totalPathSegments
        const getLessonPathPos = (idx: number) => (idx / numLessons) * totalPathSegments;

        if (lessonIdx === -1) {
            // O aluno passou de todas as lições ou está a caminho do último marco (Castelo)
            const startIdx = numLessons - 1;
            const startPathPos = getLessonPathPos(startIdx);
            const endPathPos = totalPathSegments;

            const startXP = sortedLessons[startIdx].requiredXP;
            // Para o trecho final ao castelo, assumimos um "alvo" de XP um pouco maior ou infinito
            // Se o usuário não definiu um XP pro castelo, usamos o dobro do último ou algo fixo
            const targetXP = startXP + 100;

            const xpRange = targetXP - startXP;
            const segmentProgress = xpRange > 0 ? Math.max(0, Math.min((totalXP - startXP) / xpRange, 1)) : 1;

            const precisePathProgress = startPathPos + (segmentProgress * (endPathPos - startPathPos));
            return interpolatePath(precisePathProgress, totalPathSegments);
        }

        // Ponto de partida e destino do trecho atual
        const startPathPos = getLessonPathPos(lessonIdx);
        const endPathPos = getLessonPathPos(lessonIdx + 1);

        const startXP = sortedLessons[lessonIdx].requiredXP;
        const targetXP = sortedLessons[lessonIdx + 1].requiredXP;

        const xpRange = targetXP - startXP;
        const segmentProgress = xpRange > 0 ? Math.max(0, Math.min((totalXP - startXP) / xpRange, 1)) : 1;

        const precisePathProgress = startPathPos + (segmentProgress * (endPathPos - startPathPos));
        return interpolatePath(precisePathProgress, totalPathSegments);
    };

    const interpolatePath = (precisePathProgress: number, totalPathSegments: number) => {
        const currentPathSegment = Math.min(Math.floor(precisePathProgress), totalPathSegments - 1);
        const t = precisePathProgress - currentPathSegment;

        const p1 = pathPoints[currentPathSegment];
        const p2 = pathPoints[currentPathSegment + 1];

        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
        };
    };


    return (
        <div className="trail-container" style={{
            width: '100%',
            height: '100vh',
            overflow: 'hidden'
        }}>
            <div className="vignette" />

            {/* NO OVERLAY - PURE ART BACKGROUND */}

            {/* LESSON CHECKPOINTS */}
            {sortedLessons.map((lesson, index) => {
                const totalPathSegments = pathPoints.length - 1;
                // Lição 1 (index 0) fica exatamente no começo (0%)
                const precisePathProgress = (index / Math.max(sortedLessons.length, 1)) * totalPathSegments;

                const pos = interpolatePath(precisePathProgress, totalPathSegments);
                const isEnd = index === sortedLessons.length - 1;
                const isActive = activeLessonId === lesson.id;
                const lessonMissions = missions.filter(m => m.targetLessonId === lesson.id);

                return (
                    <div key={lesson.id} style={{
                        position: 'absolute',
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -70%)',
                        zIndex: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        {/* MISSION INDICATOR (📜) */}
                        {lessonMissions.length > 0 && (
                            <div style={{ position: 'absolute', right: '-45px', top: '0%' }}>
                                {lessonMissions.map(m => {
                                    const isMissionActive = activeMissionId === m.id;
                                    return (
                                        <div key={m.id} style={{ position: 'relative', marginBottom: '5px' }}>
                                            <motion.button
                                                onClick={(e) => { e.stopPropagation(); setActiveMissionId(isMissionActive ? null : m.id); }}
                                                animate={{
                                                    scale: isMissionActive ? 1.3 : 1,
                                                    rotate: isMissionActive ? [0, 5, -5, 0] : 0
                                                }}
                                                style={{
                                                    background: 'var(--primary)', border: '2px solid white',
                                                    width: '45px', height: '45px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.4rem', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
                                                    color: 'white'
                                                }}
                                            >
                                                📜
                                            </motion.button>

                                            <AnimatePresence>
                                                {isMissionActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="game-card"
                                                        style={{
                                                            position: window.innerWidth < 600 ? 'fixed' : 'absolute',
                                                            left: window.innerWidth < 600 ? '50%' : '55px',
                                                            top: window.innerWidth < 600 ? '50%' : '0',
                                                            transform: window.innerWidth < 600 ? 'translate(-50%, -50%)' : 'none',
                                                            width: window.innerWidth < 600 ? '90vw' : '220px',
                                                            maxWidth: '280px',
                                                            padding: '15px', fontSize: '0.85rem',
                                                            background: 'rgba(20, 20, 30, 0.98)',
                                                            borderLeft: '4px solid var(--primary)',
                                                            zIndex: 2100,
                                                            boxShadow: '0 0 40px rgba(0,0,0,0.8)'
                                                        }}
                                                    >
                                                        {window.innerWidth < 600 && (
                                                            <button
                                                                onClick={() => setActiveMissionId(null)}
                                                                style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem' }}
                                                            >✕</button>
                                                        )}
                                                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>MISSÃO: {m.title.toUpperCase()}</div>
                                                        <div style={{ marginTop: '5px', opacity: 0.9 }}>{m.description}</div>
                                                        <div style={{ marginTop: '8px', color: 'var(--p-gold)', fontWeight: 'bold' }}>🏆 +{m.rewardXP} XP</div>

                                                        {user?.role === 'student' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onCompleteMission(m.id, user.id);
                                                                    setActiveMissionId(null);
                                                                    setRewardToast({ xp: m.rewardXP, show: true });
                                                                    setTimeout(() => setRewardToast(p => ({ ...p, show: false })), 3000);
                                                                }}
                                                                style={{
                                                                    marginTop: '10px', width: '100%', padding: '6px',
                                                                    background: 'var(--p-gold)', color: '#000',
                                                                    border: 'none', borderRadius: '5px', fontWeight: '900',
                                                                    fontSize: '0.65rem', cursor: 'pointer',
                                                                    boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
                                                                }}
                                                            >
                                                                SIM, EU FIZ! 🛡️
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <motion.div
                            onClick={() => setActiveLessonId(isActive ? null : lesson.id)}
                            style={{ cursor: 'pointer' }}
                            animate={{
                                y: isActive ? [0, -30, 0] : [0, -10, 0],
                                scale: isActive ? 1.5 : 1
                            }}
                            transition={{
                                repeat: isActive ? 0 : Infinity,
                                duration: isActive ? 0.4 : 4,
                                type: 'spring',
                                stiffness: 300
                            }}
                        >
                            <span style={{
                                fontSize: isEnd ? '4.5rem' : '2.8rem',
                                filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.5)) sepia(0.6) contrast(1.1)',
                                display: 'block'
                            }}>
                                {isEnd ? '🏰' : '📖'}
                            </span>
                        </motion.div>

                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                    className="game-card"
                                    style={{
                                        padding: '4px 12px', marginTop: '5px',
                                        fontSize: '0.75rem', fontWeight: '900',
                                        border: '2px solid var(--p-gold)', color: '#fff',
                                        background: 'rgba(10, 14, 18, 0.95)',
                                        borderRadius: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                                        whiteSpace: 'nowrap',
                                        zIndex: 1000
                                    }}
                                >
                                    {lesson.title.toUpperCase()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* STUDENT AVATARS (Interacting with the Map) */}
            {students.map((student) => {
                const total = student.score.estudo + student.score.louvor + student.score.atividades;
                const pos = getPosition(total);
                const isStudentActive = activeStudentId === student.id;

                return (
                    <motion.div
                        key={student.id}
                        initial={false}
                        animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                        style={{
                            position: 'absolute',
                            width: '55px', height: '55px',
                            transform: 'translate(-50%, -50%)',
                            zIndex: isStudentActive ? 700 : 600,
                            cursor: 'pointer'
                        }}
                        onClick={() => setActiveStudentId(isStudentActive ? null : student.id)}
                    >
                        {/* Soft Ground Shadow */}
                        <div style={{
                            position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                            width: '30px', height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%',
                            filter: 'blur(3px)'
                        }} />

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            animate={{ scale: isStudentActive ? 1.3 : 1 }}
                            style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                border: '2px solid white', boxShadow: '0 8px 15px rgba(0,0,0,0.4)',
                                background: '#2c3e50',
                                overflow: 'hidden', position: 'relative'
                            }}
                        >
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {student.photo ? (
                                    <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : '👤'}
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {isStudentActive && (
                                <>
                                    {/* Premium Gold Nameplate */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)' }}
                                    >
                                        <div className="game-card" style={{
                                            padding: '3px 8px', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: '900',
                                            background: 'var(--p-gold)', color: '#000', border: '2px solid white',
                                            boxShadow: '0 3px 0 rgba(0,0,0,0.2)'
                                        }}>
                                            {student.name}
                                        </div>
                                    </motion.div>

                                    {/* Level/XP Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        style={{
                                            position: 'absolute', bottom: -5, right: -15,
                                            background: '#ff3f34', color: 'white', padding: '3px 8px',
                                            borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900',
                                            border: '2px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                            zIndex: 701
                                        }}
                                    >
                                        {total} XP
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}

            <MaiAAssistant students={students} />
            {/* REWARD TOAST */}
            <AnimatePresence>
                {rewardToast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                            background: 'var(--p-gold)', color: '#000', padding: '12px 24px',
                            borderRadius: '50px', fontWeight: '900', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            zIndex: 2000, display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <span>🔥 MISSÃO CONCLUÍDA! +{rewardToast.xp} XP COLETADO PARA SUA JORNADA! 🛡️</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrailScreen;

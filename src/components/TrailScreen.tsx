import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student, Lesson, Mission } from '../App';
import MaiAAssistant from './MaiAAssistant';
import { PATH_DATA } from '../utils/pathData';

interface TrailScreenProps {
    students: Student[];
    lessons: Lesson[];
    missions: Mission[];
    user: any;
    onCompleteMission: (missionId: string, studentId: string) => void;
    onUpdateStudent: (id: string, updates: Partial<Student>) => void;
}

const TrailScreen = ({ students, lessons, missions, user, onCompleteMission, onUpdateStudent }: TrailScreenProps) => {
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
    const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
    const [rewardToast, setRewardToast] = useState<{ xp: number, show: boolean }>({ xp: 0, show: false });
    const [isUploading, setIsUploading] = useState(false);
    const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Master Scale & Centering Logic
    const baseW = 1000;
    const baseH = 800;
    const trailWidth = 650; // The horizontal safe zone we want to fit
    const trailCenterX = 15; // The horizontal center of the path data

    const isVertical = viewportSize.height > viewportSize.width;

    // On vertical mobile, we fit the width. On desktop, we cover the screen.
    const stageScale = isVertical
        ? (viewportSize.width / trailWidth)
        : Math.max(viewportSize.width / baseW, viewportSize.height / baseH);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            await onUpdateStudent(user.id, { photo: base64String });
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const getPosition = (totalXP: number) => {
        // Clamp score between 0 and 1000
        const score = Math.max(0, Math.min(Math.floor(totalXP), 1000));
        const [x, y] = PATH_DATA[score] || [0, 0];
        // Invert X based on user request to correct horizontal direction
        return { x: -x, y };
    };

    const getAdjustedPosition = (student: Student) => {
        const total = student.score.estudo + student.score.louvor + student.score.atividades;
        const pos = getPosition(total);

        // Find if student is too close to any lesson
        const collisionThreshold = 30; // pixels
        const offsetDistance = 45; // pixels

        const nearbyLesson = lessons.find(lesson => {
            const lessonPos = getPosition(lesson.requiredXP);
            const dx = pos.x - lessonPos.x;
            const dy = pos.y - lessonPos.y;
            return Math.sqrt(dx * dx + dy * dy) < collisionThreshold;
        });

        if (nearbyLesson) {
            // Use student ID to create a deterministic but varied offset angle
            const hash = student.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const angle = (hash % 8) * (Math.PI / 4); // 8 possible directions
            return {
                x: pos.x + Math.cos(angle) * offsetDistance,
                y: pos.y + Math.sin(angle) * offsetDistance
            };
        }

        return pos;
    };

    return (
        <div className="trail-container" style={{
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative' // Ensure relative positioning for children
        }}>
            <div className="vignette" />

            {/* UNIFIED SCALING STAGE (Fundo e ícones travados juntos) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: `calc(50% - ${trailCenterX}px)`,
                width: `${baseW}px`,
                height: `${baseH}px`,
                transform: `translate(-50%, -50%) scale(${stageScale})`,
                transformOrigin: 'center center',
                pointerEvents: 'none',
                // Debug: border: '2px solid red'
            }}>
                {/* Embedded Background (Ensures sync) */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: "url('/Imagem_Fundo_Melhorado.png')",
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    opacity: 1
                }} />

                <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
                    {/* LESSON CHECKPOINTS */}
                    {sortedLessons.map((lesson, index) => {
                        const pos = getPosition(lesson.requiredXP);
                        const isEnd = index === sortedLessons.length - 1;
                        const isActive = activeLessonId === lesson.id;
                        const lessonMissions = missions.filter(m => m.targetLessonId === lesson.id);

                        return (
                            <div key={lesson.id} style={{
                                position: 'absolute',
                                left: `calc(50% + ${pos.x}px)`,
                                bottom: `${pos.y}px`,
                                transform: 'translate(-50%, 50%)', // Center on point (bottom-based Y)
                                zIndex: 200,
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
                                        {isEnd ? '🏰' : (index === 0 && lesson.requiredXP === 0 ? '⛺' : '📖')}
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
                        const pos = getAdjustedPosition(student);
                        const isStudentActive = activeStudentId === student.id;

                        return (
                            <motion.div
                                key={student.id}
                                initial={false}
                                animate={{
                                    left: `calc(50% + ${pos.x}px)`,
                                    bottom: `${pos.y}px` // +1% removed, using pixels now
                                }}
                                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                                style={{
                                    position: 'absolute',
                                    width: '32px', height: '32px',
                                    transform: 'translate(-50%, 50%)', // Center on point
                                    zIndex: isStudentActive ? 700 : 300,
                                    cursor: 'pointer'
                                }}
                                onClick={() => setActiveStudentId(isStudentActive ? null : student.id)}
                            >
                                {/* Soft Ground Shadow */}
                                <div style={{
                                    position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)',
                                    width: '18px', height: '4px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%',
                                    filter: 'blur(2px)'
                                }} />

                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    animate={{ scale: isStudentActive ? 1.3 : 1 }}
                                    style={{
                                        width: '100%', height: '100%', borderRadius: '50%',
                                        border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                                        background: '#2c3e50',
                                        overflow: 'hidden', position: 'relative'
                                    }}
                                >
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.0rem' }}>
                                        {student.photo ? (
                                            <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : '👤'}
                                    </div>

                                    {/* Self-Profile Edit Overlay */}
                                    {user?.id === student.id && (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); document.getElementById(`avatar-upload-${student.id}`)?.click(); }}
                                            style={{
                                                position: 'absolute', inset: 0,
                                                background: isStudentActive ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: isStudentActive ? 1 : 0.4,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                backdropFilter: isStudentActive ? 'blur(2px)' : 'none'
                                            }}
                                        >
                                            <span style={{ fontSize: isStudentActive ? '1.0rem' : '0.7rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>📷</span>
                                            <input
                                                id={`avatar-upload-${student.id}`} type="file" hidden accept="image/*"
                                                onChange={handlePhotoUpload}
                                            />
                                            {isUploading && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '0.45rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2px' }}>
                                                    ...
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Presence Star (Gamification) */}
                                    {student.attendance?.includes(new Date().toLocaleDateString('en-CA')) && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: [1, 1.3, 1],
                                                opacity: 1,
                                                rotate: [0, 15, -15, 0],
                                                filter: ['drop-shadow(0 0 8px gold)', 'drop-shadow(0 0 18px orange)', 'drop-shadow(0 0 8px gold)']
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            style={{
                                                position: 'absolute', top: -18, right: -12,
                                                fontSize: '1.8rem',
                                                zIndex: 800, pointerEvents: 'none'
                                            }}
                                            title="Veio à aula hoje!"
                                        >
                                            🌟
                                        </motion.div>
                                    )}
                                </motion.div>

                                <AnimatePresence>
                                    {isStudentActive && (
                                        <>
                                            {/* Premium Gold Nameplate */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)' }}
                                            >
                                                <div className="game-card" style={{
                                                    padding: '2px 5px', whiteSpace: 'nowrap', fontSize: '0.6rem', fontWeight: '900',
                                                    background: 'var(--p-gold)', color: '#000', border: '2px solid white',
                                                    boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
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
                </div>
            </div>

            {/* REWARD TOAST (Fixed to viewport) */}
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


import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Student } from '../App';

interface MaiAAssistantProps {
    students: Student[];
}

const MaiAAssistant = ({ students: _students }: MaiAAssistantProps) => {
    const [message, setMessage] = useState<string>("");
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const messages = [
                "Uau! O seu progresso está incrível!",
                "Dica: Estudar a Bíblia desbloqueia novas áreas!",
                "Lembre-se: O Louvor aumenta sua velocidade na trilha!",
                "MaiA detectou um herói em ascensão!",
                "A jornada é difícil, mas o prêmio é Eterno!"
            ];

            setMessage(messages[Math.floor(Math.random() * messages.length)]);
            setShow(true);
            setTimeout(() => setShow(false), 6000);
        }, 20000);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: 100,
                        right: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="game-card" style={{
                        padding: '12px 20px',
                        maxWidth: '220px',
                        background: 'var(--surface)',
                        color: 'var(--text-dark)',
                        border: '3px solid var(--secondary)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '900', lineHeight: 1.4 }}>{message}</p>
                        {/* Arrow */}
                        <div style={{
                            position: 'absolute',
                            right: '-10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0, height: 0,
                            borderTop: '10px solid transparent',
                            borderBottom: '10px solid transparent',
                            borderLeft: '10px solid var(--secondary)'
                        }} />
                    </div>

                    <div style={{
                        width: '70px', height: '70px', borderRadius: '20px',
                        background: 'var(--secondary)', border: '4px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', boxShadow: '0 0 20px var(--secondary-glow)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        🤖
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MaiAAssistant;

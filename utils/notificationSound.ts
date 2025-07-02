// Tạo âm thanh thông báo giống Facebook/Google
export const playNotificationSound = () => {
  try {
    // Kiểm tra hỗ trợ Web Audio API
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported');
      return;
    }

    const audioContext = new AudioContext();
    
    // Tạo âm thanh thông báo với 2 nốt nhạc (giống Facebook)
    const createBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'sine';
      
      // Envelope để tạo âm thanh mềm mại
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Tạo 2 nốt nhạc giống Facebook notification
    const currentTime = audioContext.currentTime;
    createBeep(800, currentTime, 0.15);        // Nốt cao
    createBeep(600, currentTime + 0.1, 0.15);  // Nốt thấp hơn

  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

// Alternative: Sử dụng HTML5 Audio với base64 encoded sound
export const playNotificationSoundAlt = () => {
  try {
    // Âm thanh notification đơn giản được encode base64
    const audioData = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
    const audio = new Audio(audioData);
    audio.volume = 0.3;
    audio.play().catch(e => console.warn('Could not play notification sound:', e));
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

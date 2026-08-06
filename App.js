import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, SafeAreaView } from 'react-native';

// --- НАСТРОЙКИ КЛЮЧЕЙ И БОТА ---
const OPENROUTER_API_KEY = "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"; 
const TELEGRAM_BOT_TOKEN = "8989304260:AAFT1zU0YHybijCklZSrJ0tazpylsNWnBXw"; 
const TELEGRAM_CHAT_ID = "1328175221";

const I18N = {
  RU: {
    slogan: "Your personal AI arsenal from MadAI. No cards, no subscriptions, for all time.",
    placeholder: "Спроси о чём угодно...",
    bugBtn: "💡 Идея / Баг",
    newChat: "Новый чат",
    limitErr: "Лимит 100 запросов в день исчерпан!",
    shortErr: "Запрос слишком короткий (мин. 3 символа)",
    send: "Отправить",
    cancel: "Отмена"
  },
  EN: {
    slogan: "Your personal AI arsenal from MadAI. No cards, no subscriptions, for all time.",
    placeholder: "Ask anything...",
    bugBtn: "💡 Idea / Bug",
    newChat: "New Chat",
    limitErr: "Daily limit of 100 requests reached!",
    shortErr: "Query too short (min 3 chars)",
    send: "Send",
    cancel: "Cancel"
  }
};

export default function App() {
  const [lang, setLang] = useState('RU');
  const t = I18N[lang] || I18N.RU;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState({ email: 'user@gmail.com', isVip: false, dailyRequests: 0, ip: '192.168.1.1' });
  const [isAdmin, setIsAdmin] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [abortController, setAbortController] = useState(null);

  const compressPrompt = (text) => {
    return text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\s+/g, ' ').trim();
  };

  const handleSend = async () => {
    const raw = input.trim();
    if (raw.length < 3) { alert(t.shortErr); return; }
    if (!user.isVip && user.dailyRequests >= 100) { alert(t.limitErr); return; }

    const compressed = compressPrompt(raw);
    const newMsg = { id: Date.now().toString(), text: raw, sender: 'user' };
    
    const recentHistory = messages.slice(-4).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: compressPrompt(m.text)
    }));

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    const selectedModel = user.isVip ? 'deepseek/deepseek-chat' : 'deepseek/deepseek-chat:free';
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...recentHistory, { role: "user", content: compressed }]
        })
      });

      const data = await response.json();
      const aiReply = data.choices[0]?.message?.content || "Error";

      setMessages(prev => [...prev, { id: Date.now().toString(), text: aiReply, sender: 'ai' }]);
      setUser(prev => ({ ...prev, dailyRequests: prev.dailyRequests + 1 }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: "Connection error", sender: 'ai' }]);
      }
    } finally {
      setAbortController(null);
    }
  };

  const stopGeneration = () => { if (abortController) abortController.abort(); };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `💡 Feedback from ${user.email} (IP: ${user.ip}):\n${feedbackText}`
        })
      });
      alert("Sent!");
      setFeedbackText('');
      setFeedbackModal(false);
    } catch (e) {
      alert("Error sending");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.logo}>MadAI</Text>
          <Text style={styles.subtext}>{t.slogan}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.langBtn} onPress={() => setLang(prev => prev === 'EN' ? 'RU' : 'EN')}>
            <Text style={styles.langText}>{lang}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bugBtn} onPress={() => setFeedbackModal(true)}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{t.bugBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.adminBar}>
          <Text style={styles.adminText}>ADMIN | {user.email} | IP: {user.ip}</Text>
          <TouchableOpacity 
            style={[styles.adminBadge, { backgroundColor: user.isVip ? '#e11d48' : '#10b981' }]} 
            onPress={() => setUser(prev => ({ ...prev, isVip: !prev.isVip }))}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
              {user.isVip ? 'VIP Active (DeepSeek V3)' : 'Grant VIP'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text style={{ color: '#fff', fontSize: 14 }}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.resetBtn} onPress={() => setMessages([])}>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>{t.newChat}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t.placeholder}
          placeholderTextColor="#52525b"
        />

        {abortController ? (
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: '#e11d48' }]} onPress={stopGeneration}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>➤</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={feedbackModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <TextInput
              style={styles.modalInput}
              multiline
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Describe your idea or bug..."
              placeholderTextColor="#52525b"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setFeedbackModal(false)}>
                <Text style={{ color: '#fff' }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#10b981' }]} onPress={sendFeedback}>
                <Text style={{ color: '#fff' }}>{t.send}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 12, borderBottomWidth: 1, borderColor: '#18181b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#10b981', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  subtext: { color: '#71717a', fontSize: 9, marginTop: 2, maxWidth: 220 },
  headerRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  langBtn: { backgroundColor: '#18181b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#27272a' },
  langText: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
  bugBtn: { backgroundColor: '#18181b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#27272a' },
  adminBar: { backgroundColor: '#111827', padding: 6, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#1f2937' },
  adminText: { color: '#9ca3af', fontSize: 10 },
  adminBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  msg: { padding: 10, marginVertical: 3, marginHorizontal: 10, borderRadius: 8, maxWidth: '82%' },
  userMsg: { backgroundColor: '#059669', alignSelf: 'flex-end' },
  aiMsg: { backgroundColor: '#18181b', alignSelf: 'start', borderWidth: 1, borderColor: '#27272a' },
  inputBar: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#18181b', gap: 6, alignItems: 'center' },
  resetBtn: { backgroundColor: '#18181b', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#27272a' },
  input: { flex: 1, backgroundColor: '#18181b', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#27272a', fontSize: 13 },
  sendBtn: { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, justifyContent: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#18181b', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  modalInput: { backgroundColor: '#09090b', color: '#fff', padding: 10, borderRadius: 6, height: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#27272a' },
  modalBtn: { padding: 8, paddingHorizontal: 12, backgroundColor: '#27272a', borderRadius: 4 }
});
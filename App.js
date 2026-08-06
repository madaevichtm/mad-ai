import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, SafeAreaView } from 'react-native';

const OPENROUTER_API_KEY = "sk-or-v1-cf090582aa70565603ee80882ad90c9b0c797c27de40cacc70"; 
const TELEGRAM_BOT_TOKEN = "8989304260:AAFT1zU0YHybijCklZSrJ0tazpylsNWnBXw"; 
const TELEGRAM_CHAT_ID = "1328128362";

export default function App() {
  const [userEmail, setUserEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  // VIP и Админка
  const [isVip, setIsVip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Для тебя как админа

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('madai_user_email');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setIsAuth(true);
    }
  }, []);

  const handleLogin = () => {
    if (!inputEmail.includes('@') || inputEmail.length < 5) {
      alert("Введите корректный Email!");
      return;
    }
    localStorage.setItem('madai_user_email', inputEmail);
    setUserEmail(inputEmail);
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('madai_user_email');
    setIsAuth(false);
    setUserEmail('');
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Бесплатникам — Gemini 2.5 Flash Free, VIP-ам — DeepSeek V3 (Chat)
    const selectedModel = isVip ? 'deepseek/deepseek-chat' : 'google/gemini-2.5-flash:free';

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://madlinov.xyz",
          "X-Title": "MadAI"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.slice(-6).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: "user", content: text }
          ]
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || " Ошибка API OpenRouter");
      }

      const reply = data.choices?.[0]?.message?.content || "Ошибка ответа.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: ` Ошибка соединения: ${e.message}`, sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `💡 Баг/Идея от ${userEmail}:\n\n${feedbackText}`
        })
      });
      alert("Отправлено в Telegram!");
      setFeedbackText('');
      setFeedbackModal(false);
    } catch (e) {
      alert("Ошибка отправки");
    }
  };

  if (!isAuth) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.logo}>MadAI</Text>
          <Text style={styles.authSub}>Авторизация по Email</Text>
          
          <TextInput
            style={styles.authInput}
            placeholder="Ваш Email"
            placeholderTextColor="#52525b"
            value={inputEmail}
            onChangeText={setInputEmail}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.authBtn} onPress={handleLogin}>
            <Text style={styles.authBtnText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>MadAI</Text>

          <Text style={styles.userText}>{userEmail}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bugBtn} onPress={() => setFeedbackModal(true)}>
            <Text style={{ color: '#fff', fontSize: 12 }}>💡 Баг / Идея</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={{ color: '#ef4444', fontSize: 12 }}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Панель администратора / VIP */}
      {isAdmin && (
        <View style={styles.adminBar}>
          <Text style={styles.adminText}>Модель: {isVip ? ' DeepSeek V3 (Платная VIP)' : ' Gemini 2.5 (Бесплатная)'}</Text>
          <TouchableOpacity 
            style={[styles.adminBadge, { backgroundColor: isVip ? '#e11d48' : '#10b981' }]} 
            onPress={() => setIsVip(!isVip)}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
              {isVip ? 'VIP Активен (DeepSeek V3)' : 'Выдать VIP'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Чат */}
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

      {/* Ввод */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.resetBtn} onPress={() => setMessages([])}>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>Очистить</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Спроси о чём угодно..."
          placeholderTextColor="#52525b"
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? "..." : "➤"}</Text>
        </TouchableOpacity>
      </View>

      {/* Модалка */}
      <Modal visible={feedbackModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>Сообщение разработчику:</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Напишите идею или найденный баг..."
              placeholderTextColor="#52525b"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setFeedbackModal(false)}>
                <Text style={{ color: '#fff' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#10b981' }]} onPress={sendFeedback}>
                <Text style={{ color: '#fff' }}>Отправить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  authCard: { backgroundColor: '#18181b', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', width: '90%', maxWidth: 360 },
  authSub: { color: '#a1a1aa', fontSize: 13, marginVertical: 12 },
  authInput: { backgroundColor: '#09090b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#27272a', marginBottom: 12 },
  authBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  authBtnText: { color: '#fff', fontWeight: 'bold' },

  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 12, borderBottomWidth: 1, borderColor: '#18181b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#10b981', fontSize: 20, fontWeight: '900' },
  userText: { color: '#71717a', fontSize: 11, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  bugBtn: { backgroundColor: '#18181b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#27272a' },
  logoutBtn: { backgroundColor: '#18181b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#27272a' },

  adminBar: { backgroundColor: '#111827', padding: 8, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#1f2937' },
  adminText: { color: '#9ca3af', fontSize: 11 },
  adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },

  msg: { padding: 12, marginVertical: 4, marginHorizontal: 12, borderRadius: 8, maxWidth: '80%' },
  userMsg: { backgroundColor: '#059669', alignSelf: 'flex-end' },
  aiMsg: { backgroundColor: '#18181b', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#27272a' },

  inputBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#18181b', gap: 8, alignItems: 'center' },
  resetBtn: { backgroundColor: '#18181b', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#27272a' },
  input: { flex: 1, backgroundColor: '#18181b', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#27272a', fontSize: 14 },
  sendBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, justifyContent: 'center' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#18181b', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  modalInput: { backgroundColor: '#09090b', color: '#fff', padding: 10, borderRadius: 6, height: 90, textAlignVertical: 'top', borderWidth: 1, borderColor: '#27272a' },
  modalBtn: { padding: 8, paddingHorizontal: 14, backgroundColor: '#27272a', borderRadius: 6 }
});
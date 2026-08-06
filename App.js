import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, SafeAreaView, ScrollView } from 'react-native';

const OPENROUTER_API_KEY = "sk-or-v1-cf090582aa70565603ee80882ad90c9b0c797c27de40cacc70"; 
const TELEGRAM_BOT_TOKEN = "8989304260:AAFT1zU0YHybijCklZSrJOtazpylsNWnBXw"; 
const TELEGRAM_CHAT_ID = "1328175221";

// Твой суперадмин
const ADMIN_EMAIL = "glinkevichtm@gmail.com";

const LANGUAGES = ['RU', 'EN', 'ES', 'DE', 'ZH'];

const I18N = {
  RU: {
    heroTitle: "MadAI",
    heroSub: "Твой личный ИИ-арсенал. Без карт, без подписок, навсегда.",
    startBtn: "Начать →",
    loginTab: "Войти",
    regTab: "Создать аккаунт",
    namePlace: "Ваше имя",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    regBtn: "Создать аккаунт",
    loginBtn: "Войти в систему",
    whyTitle: "Преимущества MadAI",
    f1Title: "Без карт и подписок",
    f1Desc: "Бесплатно навсегда. Никаких скрытых платежей и триалов.",
    bugBtn: "💡 Идея / Баг",
    newChat: "Новый чат",
    askPlace: "Спроси о чём угодно...",
  },
  EN: {
    heroTitle: "MadAI",
    heroSub: "Your personal AI arsenal. No cards, no subscriptions, forever.",
    startBtn: "Get Started →",
    loginTab: "Sign In",
    regTab: "Create Account",
    namePlace: "Your name",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    regBtn: "Create Account",
    loginBtn: "Sign In",
    whyTitle: "Why MadAI",
    f1Title: "100% Free",
    f1Desc: "Free forever. No hidden charges or credit cards required.",
    bugBtn: "💡 Idea / Bug",
    newChat: "New Chat",
    askPlace: "Ask anything...",
  }
};

export default function App() {
  const [langIndex, setLangIndex] = useState(0);
  const currentLang = LANGUAGES[langIndex];
  const t = I18N[currentLang] || I18N.RU;

  const [screen, setScreen] = useState('landing');
  const [authMode, setAuthMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([
    { id: '1', name: 'Admin', email: ADMIN_EMAIL, role: 'admin' },
    { id: '2', name: 'User', email: 'test@gmail.com', role: 'user' },
  ]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [bugModal, setBugModal] = useState(false);
  const [bugText, setBugText] = useState('');
  const [adminModal, setAdminModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('madai_current_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentUser(parsed);
      setScreen('chat');
    }
  }, []);

  const nextLang = () => {
    setLangIndex((prev) => (prev + 1) % LANGUAGES.length);
  };

  const handleAuth = () => {
    if (!email.includes('@') || password.length < 4) {
      alert("Заполните корректно email и пароль!");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();
    const role = isAdmin ? 'admin' : 'user';

    let user = usersList.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = { id: Date.now().toString(), name: name || 'Пользователь', email: cleanEmail, role };
      setUsersList(prev => [...prev, user]);
    } else {
      user.role = role;
    }

    setCurrentUser(user);
    localStorage.setItem('madai_current_user', JSON.stringify(user));
    setScreen('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('madai_current_user');
    setCurrentUser(null);
    setScreen('landing');
  };

  const toggleUserRole = (targetId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === targetId) {
        const nextRole = u.role === 'user' ? 'vip' : u.role === 'vip' ? 'admin' : 'user';
        const updated = { ...u, role: nextRole };
        if (currentUser && currentUser.id === targetId) setCurrentUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const selectedModel = (currentUser?.role === 'admin' || currentUser?.role === 'vip') 
      ? 'deepseek/deepseek-chat' 
      : 'google/gemini-2.5-flash:free';

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
            ...messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: "user", content: text }
          ]
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || " Ошибка API ответа.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: " Ошибка связи с сервером.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendBugReport = async () => {
    if (!bugText.trim()) return;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `💡 Сообщение от ${currentUser?.email}:\n\n${bugText}`
        })
      });
      alert("Отправлено в Telegram!");
      setBugText('');
      setBugModal(false);
    } catch (e) {
      alert("Ошибка отправки");
    }
  };

  // ЛЕНДИНГ
  if (screen === 'landing') {
    return (
      <SafeAreaView style={styles.darkBg}>
        <ScrollView contentContainerStyle={styles.landingContent}>
          <View style={styles.topNav}>
            <View style={styles.logoRow}>
              <View style={styles.boltIcon}><Text style={styles.boltText}>⚡</Text></View>
              <Text style={styles.logoTitle}>MadAI</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity style={styles.langTagBig} onPress={nextLang}>
                <Text style={styles.langTextBig}>🌐 {currentLang}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('auth')}>
                <Text style={styles.navBtnText}>{t.startBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroHeader}>{t.heroTitle}</Text>
            <Text style={styles.heroSub}>{t.heroSub}</Text>
            <TouchableOpacity style={styles.mainCtaBtn} onPress={() => setScreen('auth')}>
              <Text style={styles.mainCtaText}>{t.startBtn}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>{t.whyTitle}</Text>
          <View style={styles.gridCards}>
            <View style={styles.featureCard}>
              <Text style={styles.cardIcon}>🛡️</Text>
              <Text style={styles.cardTitle}>{t.f1Title}</Text>
              <Text style={styles.cardDesc}>{t.f1Desc}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // АВТОРИЗАЦИЯ
  if (screen === 'auth') {
    return (
      <SafeAreaView style={[styles.darkBg, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.authCard}>
          <View style={styles.logoRow}>
            <View style={styles.boltIcon}><Text style={styles.boltText}>⚡</Text></View>
            <View>
              <Text style={styles.logoTitle}>MadAI</Text>
              <Text style={styles.authSub}>Авторизация</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginVertical: 16, backgroundColor: '#09090b', borderRadius: 8, padding: 3 }}>
            <TouchableOpacity style={[styles.tabBtn, authMode === 'register' && styles.activeTab]} onPress={() => setAuthMode('register')}>
              <Text style={{ color: authMode === 'register' ? '#fff' : '#71717a', fontSize: 12 }}>{t.regTab}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, authMode === 'login' && styles.activeTab]} onPress={() => setAuthMode('login')}>
              <Text style={{ color: authMode === 'login' ? '#fff' : '#71717a', fontSize: 12 }}>{t.loginTab}</Text>
            </TouchableOpacity>
          </View>

          {authMode === 'register' && (
            <TextInput style={styles.inputField} placeholder={t.namePlace} placeholderTextColor="#52525b" value={name} onChangeText={setName} />
          )}
          <TextInput style={styles.inputField} placeholder={t.emailPlace} placeholderTextColor="#52525b" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.inputField} placeholder={t.passPlace} placeholderTextColor="#52525b" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.mainCtaBtn} onPress={handleAuth}>
            <Text style={styles.mainCtaText}>{authMode === 'register' ? t.regBtn : t.loginBtn}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ЧАТ И АДМИНКА
  return (
    <SafeAreaView style={styles.darkBg}>
      <View style={styles.chatHeader}>
        <View style={styles.logoRow}>
          <View style={styles.boltIcon}><Text style={styles.boltText}>⚡</Text></View>
          <View>
            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>MadAI</Text>
            <Text style={{ color: '#71717a', fontSize: 10 }}>{currentUser?.email}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
            <TouchableOpacity style={styles.adminBadgeBtn} onPress={() => setAdminModal(true)}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>👑 Управление</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.smallBtn} onPress={() => setBugModal(true)}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{t.bugBtn}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={handleLogout}>
            <Text style={{ color: '#ef4444', fontSize: 11 }}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.msgBox, item.sender === 'user' ? styles.userBox : styles.aiBox]}>
            <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.smallBtn} onPress={() => setMessages([])}>
          <Text style={{ color: '#a1a1aa', fontSize: 11 }}>{t.newChat}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder={t.askPlace}
          placeholderTextColor="#52525b"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? "..." : "➤"}</Text>
        </TouchableOpacity>
      </View>

      {/* АДМИНКА */}
      <Modal visible={adminModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>👑 Панель управления ролями</Text>
            <ScrollView style={{ maxHeight: 250 }}>
              {usersList.map(u => (
                <View key={u.id} style={styles.userRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{u.name || 'User'}</Text>
                    <Text style={{ color: '#71717a', fontSize: 11 }}>{u.email}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.roleBadge, 
                      u.role === 'admin' ? { backgroundColor: '#ef4444' } : u.role === 'vip' ? { backgroundColor: '#3b82f6' } : { backgroundColor: '#27272a' }
                    ]}
                    onPress={() => toggleUserRole(u.id)}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{u.role.toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.smallBtn, { marginTop: 12, alignSelf: 'flex-end' }]} onPress={() => setAdminModal(false)}>
              <Text style={{ color: '#fff' }}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модалка обратной связи */}
      <Modal visible={bugModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>💡 Идея или баг:</Text>
            <TextInput
              style={styles.modalArea}
              multiline
              value={bugText}
              onChangeText={setBugText}
              placeholder="Напишите тут..."
              placeholderTextColor="#52525b"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setBugModal(false)}><Text style={{ color: '#fff' }}>Отмена</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#10b981' }]} onPress={sendBugReport}><Text style={{ color: '#fff' }}>Отправить</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  darkBg: { flex: 1, backgroundColor: '#09090b' },
  landingContent: { padding: 16, alignItems: 'center' },
  topNav: { width: '100%', maxWidth: 900, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  boltIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  boltText: { color: '#09090b', fontWeight: 'bold', fontSize: 16 },
  logoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  langTagBig: { backgroundColor: '#18181b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#10b981' },
  langTextBig: { color: '#10b981', fontSize: 14, fontWeight: 'bold' },
  
  navBtn: { backgroundColor: '#18181b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  navBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  heroSection: { alignItems: 'center', marginVertical: 40, maxWidth: 600 },
  heroHeader: { color: '#10b981', fontSize: 52, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  heroSub: { color: '#a1a1aa', fontSize: 16, textAlign: 'center', marginVertical: 16, lineHeight: 22 },
  mainCtaBtn: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  mainCtaText: { color: '#09090b', fontWeight: 'bold', fontSize: 16 },

  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 16 },
  gridCards: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 },
  featureCard: { backgroundColor: '#121215', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#1f1f23', width: 300 },
  cardIcon: { fontSize: 22, marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  cardDesc: { color: '#71717a', fontSize: 12, lineHeight: 18 },

  authCard: { backgroundColor: '#121215', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1f1f23', width: '90%', maxWidth: 380 },
  authSub: { color: '#71717a', fontSize: 11 },
  tabBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#18181b' },
  inputField: { backgroundColor: '#09090b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#27272a', marginBottom: 10, fontSize: 13 },

  chatHeader: { padding: 12, borderBottomWidth: 1, borderColor: '#18181b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminBadgeBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallBtn: { backgroundColor: '#18181b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#27272a' },
  msgBox: { padding: 12, marginVertical: 4, borderRadius: 10, maxWidth: '82%' },
  userBox: { backgroundColor: '#059669', alignSelf: 'flex-end' },
  aiBox: { backgroundColor: '#121215', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1f1f23' },

  bottomBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: '#18181b', gap: 8, alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#121215', color: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1f1f23', fontSize: 13 },
  sendBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#121215', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#1f1f23' },
  modalArea: { backgroundColor: '#09090b', color: '#fff', padding: 10, borderRadius: 8, height: 90, textAlignVertical: 'top', borderWidth: 1, borderColor: '#27272a' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1f1f23' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }
});
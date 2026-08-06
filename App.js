import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, SafeAreaView, ScrollView } from 'react-native';

const OPENROUTER_API_KEY = "sk-or-v1-cf090582aa70565603ee80882ad90c9b0c797c27de40cacc70"; 
const TELEGRAM_BOT_TOKEN = "8989304260:AAFT1zUOYHybijCklZSrJOtazpylsNWnBXw"; 
const TELEGRAM_CHAT_ID = "1328175221";

const ADMIN_EMAIL = "glinkevichtm@gmail.com";

const LANGUAGES = [
  { code: 'RU', name: 'Русский' },
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Español' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'ZH', name: '中文' },
];

const TRANSLATIONS = {
  RU: {
    heroSub: "Твой личный ИИ-арсенал. Без карт, без подписок, навсегда.",
    startBtn: "Начать →",
    regTab: "Создать аккаунт",
    loginTab: "Войти",
    namePlace: "Ваше имя",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    f1Title: "Без карт и подписок",
    f1Desc: "Бесплатно навсегда. Никаких скрытых платежей и триалов.",
    f2Title: "Молниеносный отклик",
    f2Desc: "Минимальная задержка при генерации ответов от нейросетей.",
    f3Title: "Премиум модели",
    f3Desc: "Доступ к DeepSeek V3 и Gemini 2.5 без ограничений.",
    newChat: "Очистить",
    askPlace: "Спроси о чём угодно...",
    bugBtn: "💡 Баг",
    logout: "Выйти",
    adminBtn: "👑 Админка",
  },
  EN: {
    heroSub: "Your personal AI arsenal. No cards, no subscriptions, forever.",
    startBtn: "Get Started →",
    regTab: "Create Account",
    loginTab: "Sign In",
    namePlace: "Your name",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    f1Title: "No Credit Cards",
    f1Desc: "Free forever. No hidden charges or paid subscriptions.",
    f2Title: "Lightning Fast",
    f2Desc: "Ultra-low latency streaming for all AI responses.",
    f3Title: "Premium Models",
    f3Desc: "Access DeepSeek V3 and Gemini 2.5 seamless integration.",
    newChat: "Clear",
    askPlace: "Ask anything...",
    bugBtn: "💡 Bug",
    logout: "Sign Out",
    adminBtn: "👑 Admin",
  },
  ES: {
    heroSub: "Tu arsenal personal de IA. Sin tarjetas, sin suscripciones, para siempre.",
    startBtn: "Empezar →",
    regTab: "Crear cuenta",
    loginTab: "Iniciar sesión",
    namePlace: "Tu nombre",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    f1Title: "Sin tarjetas",
    f1Desc: "Gratis para siempre. Sin cargos ocultos.",
    f2Title: "Ultra rápido",
    f2Desc: "Respuesta instantánea de los modelos de IA.",
    f3Title: "Modelos Premium",
    f3Desc: "Acceso a DeepSeek V3 y Gemini 2.5.",
    newChat: "Limpiar",
    askPlace: "Pregunta lo que sea...",
    bugBtn: "💡 Error",
    logout: "Salir",
    adminBtn: "👑 Admin",
  },
  DE: {
    heroSub: "Ihr persönliches KI-Arsenal. Keine Karten, keine Abos, für immer.",
    startBtn: "Starten →",
    regTab: "Konto erstellen",
    loginTab: "Anmelden",
    namePlace: "Ihr Name",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    f1Title: "Ohne Kreditkarte",
    f1Desc: "Kostenlos für immer. Keine versteckten Gebühren.",
    f2Title: "Blitzschnell",
    f2Desc: "Minimale Verzögerung bei Antworten.",
    f3Title: "Premium-Modelle",
    f3Desc: "Zugriff auf DeepSeek V3 und Gemini 2.5.",
    newChat: "Löschen",
    askPlace: "Frage etwas...",
    bugBtn: "💡 Bug",
    logout: "Abmelden",
    adminBtn: "👑 Admin",
  },
  FR: {
    heroSub: "Votre arsenal personnel d'IA. Sans carte, sans abonnement, pour toujours.",
    startBtn: "Commencer →",
    regTab: "Créer un compte",
    loginTab: "Connexion",
    namePlace: "Votre nom",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    f1Title: "Sans carte bancaire",
    f1Desc: "Gratuit pour toujours. Aucun frais caché.",
    f2Title: "Ultra rapide",
    f2Desc: "Réponses instantanées des modèles d'IA.",
    f3Title: "Modèles Premium",
    f3Desc: "Accès à DeepSeek V3 et Gemini 2.5.",
    newChat: "Effacer",
    askPlace: "Posez une question...",
    bugBtn: "💡 Bug",
    logout: "Déconnexion",
    adminBtn: "👑 Admin",
  },
  ZH: {
    heroSub: "你的个人人工智能库。无需绑卡，完全免费，永久使用。",
    startBtn: "开始使用 →",
    regTab: "创建账户",
    loginTab: "登录",
    namePlace: "你的名字",
    emailPlace: "you@example.com",
    passPlace: "••••••••",
    f1Title: "完全免费",
    f1Desc: "永久免费，没有任何隐藏费用。",
    f2Title: "极速响应",
    f2Desc: "AI 模型超低延迟秒回。",
    f3Title: "顶级 AI 模型",
    f3Desc: "支持 DeepSeek V3 与 Gemini 2.5。",
    newChat: "清空",
    askPlace: "输入任何问题...",
    bugBtn: "💡 反馈",
    logout: "退出",
    adminBtn: "👑 管理员",
  }
};

const FREE_MODELS = [
  { id: 'google/gemini-2.5-flash:free', name: 'Gemini 2.5 Flash (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
];

const VIP_MODELS = [
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Premium)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Premium)' },
];

export default function App() {
  const [langCode, setLangCode] = useState('RU');
  const [langDropdown, setLangDropdown] = useState(false);
  const t = TRANSLATIONS[langCode] || TRANSLATIONS.RU;

  const [screen, setScreen] = useState('landing');
  const [authMode, setAuthMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userIp, setUserIp] = useState('127.0.0.1');

  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0].id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [bugModal, setBugModal] = useState(false);
  const [bugText, setBugText] = useState('');
  const [adminModal, setAdminModal] = useState(false);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip || '127.0.0.1'))
      .catch(() => setUserIp('127.0.0.1'));

    const savedUsers = localStorage.getItem('madai_users_db_v2');
    let db = savedUsers ? JSON.parse(savedUsers) : [];
    setUsersList(db);

    const savedSession = localStorage.getItem('madai_current_session_v2');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setCurrentUser(parsed);
      setScreen('chat');
    }
  }, []);

  const saveUsersDb = (newDb) => {
    setUsersList(newDb);
    localStorage.setItem('madai_users_db_v2', JSON.stringify(newDb));
  };

  const handleAuth = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || password.length < 4) {
      alert("Введите корректный Email и пароль (мин. 4 символа)!");
      return;
    }

    if (authMode === 'register') {
      const exists = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        alert("Пользователь с таким email уже зарегистрирован! Попробуйте войти.");
        return;
      }

      const role = cleanEmail === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
      const newUser = {
        id: Date.now().toString(),
        name: name || 'User',
        email: cleanEmail,
        password: password,
        role: role,
        ip: userIp
      };

      const updatedDb = [...usersList, newUser];
      saveUsersDb(updatedDb);
      setCurrentUser(newUser);
      localStorage.setItem('madai_current_session_v2', JSON.stringify(newUser));
      setScreen('chat');
    } else {
      const user = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        alert("Пользователь не найден! Зарегистрируйтесь.");
        return;
      }

      if (user.password !== password) {
        alert("Неверный пароль!");
        return;
      }

      user.ip = userIp;
      if (cleanEmail === ADMIN_EMAIL.toLowerCase()) user.role = 'admin';

      saveUsersDb(usersList);
      setCurrentUser(user);
      localStorage.setItem('madai_current_session_v2', JSON.stringify(user));
      setScreen('chat');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('madai_current_session_v2');
    setCurrentUser(null);
    setScreen('landing');
  };

  const toggleUserRole = (targetId) => {
    const updated = usersList.map(u => {
      if (u.id === targetId) {
        const nextRole = u.role === 'user' ? 'vip' : u.role === 'vip' ? 'admin' : 'user';
        const newObj = { ...u, role: nextRole };
        if (currentUser && currentUser.id === targetId) {
          setCurrentUser(newObj);
          localStorage.setItem('madai_current_session_v2', JSON.stringify(newObj));
        }
        return newObj;
      }
      return u;
    });
    saveUsersDb(updated);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

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
      const reply = data.choices?.[0]?.message?.content || "Ошибка API ответа.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Ошибка связи с сервером.", sender: 'ai' }]);
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
          text: `💡 Сообщение от ${currentUser?.email} (IP: ${currentUser?.ip}):\n\n${bugText}`
        })
      });
      alert("Отправлено в Telegram!");
      setBugText('');
      setBugModal(false);
    } catch (e) {
      alert("Ошибка отправки");
    }
  };

  const LanguageSelector = () => {
    const currentLangObj = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
    return (
      <View style={{ position: 'relative', zIndex: 9999 }}>
        <TouchableOpacity style={styles.langDropBtn} onPress={() => setLangDropdown(!langDropdown)}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>🌐 {currentLangObj.name}</Text>
        </TouchableOpacity>

        {langDropdown && (
          <View style={styles.langMenu}>
            <ScrollView style={{ maxHeight: 220 }}>
              {LANGUAGES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.langMenuItem}
                  onPress={() => {
                    setLangCode(item.code);
                    setLangDropdown(false);
                  }}
                >
                  <Text style={{ color: item.code === langCode ? '#10b981' : '#a1a1aa', fontWeight: item.code === langCode ? 'bold' : 'normal', fontSize: 13 }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

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
              <LanguageSelector />
              <TouchableOpacity style={styles.navBtn} onPress={() => setScreen('auth')}>
                <Text style={styles.navBtnText}>{t.startBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroHeader}>MadAI</Text>
            <Text style={styles.heroSub}>{t.heroSub}</Text>
            <TouchableOpacity style={styles.mainCtaBtn} onPress={() => setScreen('auth')}>
              <Text style={styles.mainCtaText}>{t.startBtn}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridCards}>
            <View style={styles.featureCard}>
              <Text style={styles.cardIcon}>🛡️</Text>
              <Text style={styles.cardTitle}>{t.f1Title}</Text>
              <Text style={styles.cardDesc}>{t.f1Desc}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.cardIcon}>⚡</Text>
              <Text style={styles.cardTitle}>{t.f2Title}</Text>
              <Text style={styles.cardDesc}>{t.f2Desc}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.cardIcon}>🤖</Text>
              <Text style={styles.cardTitle}>{t.f3Title}</Text>
              <Text style={styles.cardDesc}>{t.f3Desc}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabBtn, authMode === 'register' && styles.activeTab]} onPress={() => setAuthMode('register')}>
              <Text style={{ color: authMode === 'register' ? '#fff' : '#71717a', fontSize: 12, fontWeight: 'bold' }}>{t.regTab}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, authMode === 'login' && styles.activeTab]} onPress={() => setAuthMode('login')}>
              <Text style={{ color: authMode === 'login' ? '#fff' : '#71717a', fontSize: 12, fontWeight: 'bold' }}>{t.loginTab}</Text>
            </TouchableOpacity>
          </View>

          {authMode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t.namePlace}</Text>
              <TextInput style={styles.inputField} placeholder={t.namePlace} placeholderTextColor="#52525b" value={name} onChangeText={setName} />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Почта</Text>
            <TextInput style={styles.inputField} placeholder={t.emailPlace} placeholderTextColor="#52525b" value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Пароль</Text>
            <TextInput style={styles.inputField} placeholder={t.passPlace} placeholderTextColor="#52525b" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.mainCtaBtn} onPress={handleAuth}>
            <Text style={styles.mainCtaText}>{authMode === 'register' ? t.regTab : t.loginTab}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isUserVipOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'vip';

  return (
    <SafeAreaView style={styles.darkBg}>
      <View style={styles.chatHeader}>
        <View style={styles.logoRow}>
          <View style={styles.boltIcon}><Text style={styles.boltText}>⚡</Text></View>
          <View>
            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>MadAI</Text>
            <Text style={{ color: '#71717a', fontSize: 10 }}>{currentUser?.email} | IP: {currentUser?.ip}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LanguageSelector />
          {currentUser?.role === 'admin' && (
            <TouchableOpacity style={styles.adminBadgeBtn} onPress={() => setAdminModal(true)}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{t.adminBtn}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.smallBtn} onPress={() => setBugModal(true)}>
            <Text style={{ color: '#fff', fontSize: 11 }}>{t.bugBtn}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={handleLogout}>
            <Text style={{ color: '#ef4444', fontSize: 11 }}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modelBar}>
        <Text style={{ color: '#71717a', fontSize: 11, marginRight: 8 }}>Модель:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FREE_MODELS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modelChip, selectedModel === m.id && styles.modelChipActive]}
              onPress={() => setSelectedModel(m.id)}
            >
              <Text style={{ color: selectedModel === m.id ? '#10b981' : '#a1a1aa', fontSize: 11, fontWeight: 'bold' }}>{m.name}</Text>
            </TouchableOpacity>
          ))}

          {VIP_MODELS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modelChip, selectedModel === m.id && styles.modelChipActive, !isUserVipOrAdmin && { opacity: 0.5 }]}
              onPress={() => {
                if (!isUserVipOrAdmin) {
                  alert("Премиум модели доступны только VIP пользователям!");
                  return;
                }
                setSelectedModel(m.id);
              }}
            >
              <Text style={{ color: selectedModel === m.id ? '#10b981' : '#3b82f6', fontSize: 11, fontWeight: 'bold' }}>
                {m.name} {!isUserVipOrAdmin && '🔒 (VIP)'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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

      <Modal visible={adminModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>👑 Панель управления пользователями</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {usersList.map(u => (
                <View key={u.id} style={styles.userRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{u.name || 'User'}</Text>
                    <Text style={{ color: '#71717a', fontSize: 11 }}>{u.email} | IP: {u.ip || 'Неизвестен'}</Text>
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

  langDropBtn: { backgroundColor: '#121215', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  langMenu: { position: 'absolute', top: 38, right: 0, backgroundColor: '#121215', borderRadius: 8, borderWidth: 1, borderColor: '#27272a', width: 140, padding: 4, elevation: 5 },
  langMenuItem: { padding: 8, borderRadius: 6 },

  navBtn: { backgroundColor: '#18181b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  navBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  heroSection: { alignItems: 'center', marginVertical: 40, maxWidth: 600 },
  heroHeader: { color: '#10b981', fontSize: 52, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  heroSub: { color: '#a1a1aa', fontSize: 16, textAlign: 'center', marginVertical: 16, lineHeight: 22 },
  mainCtaBtn: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  mainCtaText: { color: '#09090b', fontWeight: 'bold', fontSize: 16 },

  gridCards: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900, marginTop: 20 },
  featureCard: { backgroundColor: '#121215', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#1f1f23', width: 260 },
  cardIcon: { fontSize: 22, marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  cardDesc: { color: '#71717a', fontSize: 12, lineHeight: 18 },

  authCard: { backgroundColor: '#121215', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1f1f23', width: '90%', maxWidth: 380 },
  authSub: { color: '#71717a', fontSize: 11 },
  tabContainer: { flexDirection: 'row', marginVertical: 16, backgroundColor: '#09090b', borderRadius: 8, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#18181b' },
  inputWrapper: { marginBottom: 12 },
  inputLabel: { color: '#a1a1aa', fontSize: 12, marginBottom: 4 },
  inputField: { backgroundColor: '#09090b', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#27272a', fontSize: 13 },

  chatHeader: { padding: 12, borderBottomWidth: 1, borderColor: '#18181b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminBadgeBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallBtn: { backgroundColor: '#18181b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#27272a' },
  
  modelBar: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 12, backgroundColor: '#121215', borderBottomWidth: 1, borderColor: '#1f1f23' },
  modelChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a' },
  modelChipActive: { borderColor: '#10b981', backgroundColor: '#064e3b' },

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
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, SafeAreaView, ScrollView } from 'react-native';

const OPENROUTER_API_KEY = "sk-or-v1-cf090582aa70565603ee80882ad90c9b0c797c27de40cacc70"; 
const TELEGRAM_BOT_TOKEN = "8989304260:AAFT1zUOYHybijCklZSrJOtazpylsNWnBXw"; 
const TELEGRAM_CHAT_ID = "1328175221";

const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY || "";
const ADMIN_EMAIL = "glinkevichtm@gmail.com";

const LANGUAGES = [
  { code: 'RU', name: 'Русский' },
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Español' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'ZH', name: '中文' },
];

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

  const [screen, setScreen] = useState('landing');
  const [authMode, setAuthMode] = useState('register');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [userIp, setUserIp] = useState('127.0.0.1');

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [sentCode, setSentCode] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0].id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [bugModal, setBugModal] = useState(false);
  const [bugText, setBugText] = useState('');
  const [adminModal, setAdminModal] = useState(false);

  const otpInputs = useRef([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip || '127.0.0.1'))
      .catch(() => setUserIp('127.0.0.1'));

    const savedUsers = localStorage.getItem('madai_users_db_v5');
    let db = savedUsers ? JSON.parse(savedUsers) : [];
    setUsersList(db);

    const savedSession = localStorage.getItem('madai_current_session_v5');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setCurrentUser(parsed);
      setScreen('chat');
    }
  }, []);

  const saveUsersDb = (newDb) => {
    setUsersList(newDb);
    localStorage.setItem('madai_users_db_v5', JSON.stringify(newDb));
  };

  const getPasswordStrength = () => {
    if (!password) return { label: 'Слабый', color: '#ef4444', score: 1 };
    if (password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: 'Сильный', color: '#10b981', score: 3 };
    }
    if (password.length >= 6) {
      return { label: 'Средний', color: '#f59e0b', score: 2 };
    }
    return { label: 'Слабый', color: '#ef4444', score: 1 };
  };

  const sendEmailVerification = async (targetEmail, code) => {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [targetEmail],
          subject: 'Код подтверждения регистрации MadAI',
          html: `
            <div style="background-color: #060b0e; color: #ffffff; padding: 30px; font-family: sans-serif; border-radius: 12px; border: 1px solid #10b981;">
              <h2 style="color: #10b981; margin-bottom: 10px;">MadAI Verification</h2>
              <p style="font-size: 14px; color: #a1a1aa;">Ваш 6-значный код для подтверждения почты:</p>
              <div style="background: #0c1419; padding: 18px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981; text-align: center; margin: 20px 0; border: 1px solid #1f2937;">
                ${code}
              </div>
              <p style="font-size: 12px; color: #6b7280;">Если вы не регистрировались в MadAI, просто проигнорируйте это письмо.</p>
            </div>
          `
        })
      });
      return true;
    } catch (e) {
      console.error("Resend error:", e);
      return false;
    }
  };

  const handleStartAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showToast("Введите корректный E-mail!");
      return;
    }

    if (authMode === 'register') {
      if (password.length < 4) {
        showToast("Пароль должен быть от 4 символов!");
        return;
      }
      if (password !== confirmPassword) {
        showToast("Пароли не совпадают!");
        return;
      }
      if (!agreeTerms) {
        showToast("Примите условия использования!");
        return;
      }

      const exists = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        showToast("Пользователь уже существует! Нажмите 'Войти'.");
        return;
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(generatedCode);

      const role = cleanEmail === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
      setPendingUser({
        id: Date.now().toString(),
        name: name || 'Пользователь',
        email: cleanEmail,
        password: password,
        role: role,
        ip: userIp
      });

      sendEmailVerification(cleanEmail, generatedCode);
      setScreen('verify');
      showToast("Код отправлен на вашу почту!");
    } else {
      const user = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        showToast("Пользователь не найден! Зарегистрируйтесь.");
        return;
      }
      if (user.password !== password) {
        showToast("Неверный пароль!");
        return;
      }

      user.ip = userIp;
      if (cleanEmail === ADMIN_EMAIL.toLowerCase()) user.role = 'admin';

      saveUsersDb(usersList);
      setCurrentUser(user);
      localStorage.setItem('madai_current_session_v5', JSON.stringify(user));
      setScreen('chat');
    }
  };

  const handleVerifyOtp = () => {
    const enteredCode = otpCode.join('');
    if (enteredCode === sentCode) {
      const updatedDb = [...usersList, pendingUser];
      saveUsersDb(updatedDb);
      setCurrentUser(pendingUser);
      localStorage.setItem('madai_current_session_v5', JSON.stringify(pendingUser));
      setPendingUser(null);
      setScreen('chat');
      showToast("Почта подтверждена! Добро пожаловать.");
    } else {
      showToast("Неверный код подтверждения!");
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otpCode];
    newOtp[index] = text;
    setOtpCode(newOtp);

    if (text && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('madai_current_session_v5');
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
          localStorage.setItem('madai_current_session_v5', JSON.stringify(newObj));
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
      const reply = data.choices?.[0]?.message?.content || "Ошибка получения ответа.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Ошибка соединения с сервером.", sender: 'ai' }]);
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
      showToast("Отправлено в Telegram!");
      setBugText('');
      setBugModal(false);
    } catch (e) {
      showToast("Ошибка отправки");
    }
  };

  const LanguageSelector = () => {
    const currentLangObj = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
    return (
      <View style={{ zIndex: 9999 }}>
        <TouchableOpacity style={styles.langDropBtn} onPress={() => setLangDropdown(!langDropdown)}>
          <Text style={{ color: '#fff', fontSize: 13 }}>🌐 Язык: {currentLangObj.code}</Text>
        </TouchableOpacity>

        {langDropdown && (
          <View style={styles.langMenu}>
            <ScrollView style={{ maxHeight: 180 }}>
              {LANGUAGES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.langMenuItem}
                  onPress={() => {
                    setLangCode(item.code);
                    setLangDropdown(false);
                  }}
                >
                  <Text style={{ color: item.code === langCode ? '#10b981' : '#a1a1aa', fontSize: 13 }}>
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

  const ToastNotice = () => {
    if (!toastVisible) return null;
    return (
      <View style={styles.toastContainer}>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    );
  };

  // 1. ЛЕНДИНГ С ЭСТЕТИКОЙ ВВОДНОГО СКРИНА
  if (screen === 'landing') {
    return (
      <SafeAreaView style={styles.darkBgWave}>
        <ToastNotice />
        
        {/* Шапка с языком и онлайн-статусом */}
        <View style={styles.topNavCenter}>
          <LanguageSelector />
          <View style={styles.statusBadge}>
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>Статус: Онлайн</Text>
            <View style={styles.greenDotGlow} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.landingContentCenter}>
          <View style={styles.heroSection}>
            <Text style={styles.heroHeader}>MadAI</Text>
            <Text style={styles.heroSub}>
              Твой личный ИИ-арсенал. Премиум-доступ для всех. Скрытая мощь, доступная каждому.
            </Text>
            
            <TouchableOpacity style={styles.heroButtonGlow} onPress={() => setScreen('auth')}>
              <Text style={styles.heroButtonText}>Начать →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>ПРЕИМУЩЕСТВА MadAI</Text>

          <View style={styles.gridCardsCenter}>
            <View style={styles.featureCardWave}>
              <Text style={styles.cardIcon}>🛡️ 🎁</Text>
              <Text style={styles.cardTitle}>БАЗОВЫЙ ДОСТУП.</Text>
              <Text style={styles.cardDesc}>
                Мощные ИИ-модели — бесплатно. Полный доступ к ключевым возможностям.
              </Text>
            </View>

            <View style={styles.featureCardWave}>
              <Text style={styles.cardIcon}>🔒</Text>
              <Text style={styles.cardTitle}>АБСОЛЮТНАЯ ПРИВАТНОСТЬ.</Text>
              <Text style={styles.cardDesc}>
                Полная анонимность. Твои запросы остаются в тени. Ноль логов.
              </Text>
            </View>

            <View style={styles.featureCardWave}>
              <Text style={styles.cardIcon}>⏱️</Text>
              <Text style={styles.cardTitle}>ГЛУБОКАЯ КАЛИБРОВКА.</Text>
              <Text style={styles.cardDesc}>
                Настраивайте ИИ без скрытых корпоративных фильтров. Полная свобода и чистая производительность.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footerBarCenter}>
          <Text style={styles.footerText}>© 2026 MadAI. All rights reserved.</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={styles.footerLink}>Политика приватности</Text>
            <Text style={styles.footerLink}>Условия использования</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 2. ФОРМА АВТОРИЗАЦИИ / РЕГИСТРАЦИИ
  if (screen === 'auth') {
    const strength = getPasswordStrength();
    return (
      <SafeAreaView style={[styles.darkBgWave, { justifyContent: 'center', alignItems: 'center' }]}>
        <ToastNotice />
        <View style={styles.topNavAbsoluteCenter}>
          <LanguageSelector />
          <View style={styles.statusBadge}>
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>Статус: Онлайн</Text>
            <View style={styles.greenDotGlow} />
          </View>
        </View>

        <View style={styles.authCardGlow}>
          <Text style={styles.authTitle}>{authMode === 'register' ? 'Создать аккаунт' : 'Войти в аккаунт'}</Text>

          {authMode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Имя</Text>
              <TextInput style={styles.inputField} placeholder="Введите ваше имя" placeholderTextColor="#4b5563" value={name} onChangeText={setName} />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Почта</Text>
            <TextInput style={styles.inputField} placeholder="Введите ваш e-mail" placeholderTextColor="#4b5563" value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>

          <View style={styles.inputWrapper}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.inputLabel}>Пароль</Text>
              {authMode === 'register' && (
                <Text style={{ color: strength.color, fontSize: 11, fontWeight: 'bold' }}>{strength.label}</Text>
              )}
            </View>
            <TextInput style={styles.inputField} placeholder="Введите пароль" placeholderTextColor="#4b5563" value={password} onChangeText={setPassword} secureTextEntry />
            {authMode === 'register' && (
              <View style={styles.strengthBarBg}>
                <View style={[styles.strengthBarFill, { width: `${(strength.score / 3) * 100}%`, backgroundColor: strength.color }]} />
              </View>
            )}
          </View>

          {authMode === 'register' && (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Подтвердить пароль</Text>
                <TextInput style={styles.inputField} placeholder="Повторите пароль" placeholderTextColor="#4b5563" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              </View>

              <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreeTerms(!agreeTerms)}>
                <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]} />
                <Text style={{ color: '#9ca3af', fontSize: 11, flex: 1 }}>
                  Я принимаю <Text style={{ color: '#38bdf8' }}>Условия использования</Text> и <Text style={{ color: '#38bdf8' }}>Политику приватности</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.heroButtonGlow} onPress={handleStartAuth}>
            <Text style={styles.heroButtonText}>{authMode === 'register' ? 'Создать аккаунт →' : 'Войти →'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>
              {authMode === 'register' ? 'Уже есть аккаунт? ' : 'Ещё нет аккаунта? '}
              <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>[{authMode === 'register' ? 'Войти' : 'Создать'}]</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerBarAbsoluteCenter}>
          <Text style={styles.footerText}>© 2026 MadAI. All rights reserved.</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={styles.footerLink}>Политика приватности</Text>
            <Text style={styles.footerLink}>Условия использования</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 3. OTP
  if (screen === 'verify') {
    return (
      <SafeAreaView style={[styles.darkBgWave, { justifyContent: 'center', alignItems: 'center' }]}>
        <ToastNotice />
        <View style={styles.authCardGlow}>
          <Text style={styles.authTitleCenter}>Подтвердите вашу почту</Text>
          <Text style={styles.otpSubText}>
            Мы отправили код подтверждения на <Text style={{ color: '#fff' }}>{email}</Text>. Введите его ниже.
          </Text>

          <View style={styles.otpContainer}>
            {otpCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => otpInputs.current[index] = el}
                style={styles.otpBoxGlow}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.heroButtonGlow} onPress={handleVerifyOtp}>
            <Text style={styles.heroButtonText}>Подтвердить</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={handleStartAuth}>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>
              Не получили код? <Text style={{ color: '#38bdf8' }}>[Отправить повторно]</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 4. ЧАТ
  const isUserVipOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'vip';

  return (
    <SafeAreaView style={styles.darkBgWave}>
      <ToastNotice />
      <View style={styles.chatHeader}>
        <View style={styles.logoRow}>
          <View style={styles.boltIcon}><Text style={styles.boltText}>⚡</Text></View>
          <View>
            <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>MadAI</Text>
            <Text style={{ color: '#6b7280', fontSize: 10 }}>{currentUser?.email}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LanguageSelector />
          {currentUser?.role === 'admin' && (
            <TouchableOpacity style={styles.adminBadgeBtn} onPress={() => setAdminModal(true)}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>👑 Админка</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.smallBtn} onPress={() => setBugModal(true)}>
            <Text style={{ color: '#fff', fontSize: 11 }}>💡 Баг</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={handleLogout}>
            <Text style={{ color: '#ef4444', fontSize: 11 }}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modelBar}>
        <Text style={{ color: '#6b7280', fontSize: 11, marginRight: 8 }}>Модель:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FREE_MODELS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modelChip, selectedModel === m.id && styles.modelChipActive]}
              onPress={() => setSelectedModel(m.id)}
            >
              <Text style={{ color: selectedModel === m.id ? '#10b981' : '#9ca3af', fontSize: 11, fontWeight: 'bold' }}>{m.name}</Text>
            </TouchableOpacity>
          ))}

          {VIP_MODELS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modelChip, selectedModel === m.id && styles.modelChipActive, !isUserVipOrAdmin && { opacity: 0.5 }]}
              onPress={() => {
                if (!isUserVipOrAdmin) {
                  showToast("Доступно только VIP пользователям!");
                  return;
                }
                setSelectedModel(m.id);
              }}
            >
              <Text style={{ color: selectedModel === m.id ? '#10b981' : '#38bdf8', fontSize: 11, fontWeight: 'bold' }}>
                {m.name} {!isUserVipOrAdmin && '🔒 (VIP)'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12, maxWidth: 900, alignSelf: 'center', width: '100%' }}
        renderItem={({ item }) => (
          <View style={[styles.msgBox, item.sender === 'user' ? styles.userBox : styles.aiBox]}>
            <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.bottomBarCenter}>
        <View style={styles.inputInnerRow}>
          <TouchableOpacity style={styles.smallBtn} onPress={() => setMessages([])}>
            <Text style={{ color: '#9ca3af', fontSize: 11 }}>Очистить</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Спроси о чём угодно..."
            placeholderTextColor="#4b5563"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? "..." : "➤"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={adminModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>👑 Панель управления пользователей</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {usersList.map(u => (
                <View key={u.id} style={styles.userRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{u.name || 'User'}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 11 }}>{u.email} | IP: {u.ip || '127.0.0.1'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.roleBadge, 
                      u.role === 'admin' ? { backgroundColor: '#ef4444' } : u.role === 'vip' ? { backgroundColor: '#38bdf8' } : { backgroundColor: '#1f2937' }
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
              placeholderTextColor="#4b5563"
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
  // Абстрактный волнистый фон с глубоким сине-изумрудным градиентом
  darkBgWave: { 
    flex: 1, 
    backgroundColor: '#04080c', 
    backgroundImage: 'radial-gradient(circle at 50% 30%, #0d1e28 0%, #030609 70%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'800\' viewBox=\'0 0 800 800\'%3E%3Cpath fill=\'none\' stroke=\'%230e2f38\' stroke-width=\'1\' opacity=\'0.25\' d=\'M0,100 Q400,300 800,100 T800,500 Q400,700 0,500 Z M0,200 Q400,400 800,200 T800,600 Q400,800 0,600 Z\'/%3E%3C/svg%3E")', 
    backgroundSize: 'cover, cover'
  },

  landingContentCenter: { padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: '85%', paddingBottom: 80 },
  
  topNavCenter: { width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, zIndex: 999 },
  topNavAbsoluteCenter: { position: 'absolute', top: 16, left: 0, right: 0, width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, zIndex: 999 },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greenDotGlow: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' },

  langDropBtn: { backgroundColor: 'rgba(15, 23, 42, 0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1e293b' },
  langMenu: { position: 'absolute', top: 42, left: 0, backgroundColor: '#090d12', borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', width: 140, padding: 4, elevation: 10, zIndex: 9999 },
  langMenuItem: { padding: 8, borderRadius: 6 },

  heroSection: { alignItems: 'center', marginVertical: 35, maxWidth: 700, width: '100%' },
  heroHeader: { color: '#ffffff', fontSize: 72, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
  heroSub: { color: '#9ca3af', fontSize: 16, textAlign: 'center', marginVertical: 22, lineHeight: 26, maxWidth: 620 },
  
  heroButtonGlow: { 
    backgroundColor: '#071217', 
    paddingHorizontal: 36, 
    paddingVertical: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#22d3ee', 
    boxShadow: '0 0 18px rgba(34, 211, 238, 0.35)', 
    alignItems: 'center' 
  },
  heroButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },

  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', letterSpacing: 2, marginTop: 40, marginBottom: 24, textAlign: 'center' },
  gridCardsCenter: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1100, width: '100%' },
  
  featureCardWave: { 
    backgroundColor: 'rgba(8, 15, 22, 0.75)', 
    padding: 24, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)', 
    width: 320,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  cardIcon: { fontSize: 24, marginBottom: 14 },
  cardTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1, marginBottom: 10 },
  cardDesc: { color: '#9ca3af', fontSize: 12, lineHeight: 20 },

  footerBarCenter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderTopWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', width: '100%', maxWidth: 1100, alignSelf: 'center' },
  footerBarAbsoluteCenter: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: 16 },
  footerText: { color: '#6b7280', fontSize: 11 },
  footerLink: { color: '#6b7280', fontSize: 11 },

  toastContainer: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, zIndex: 99999, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' },
  toastText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

  authCardGlow: { backgroundColor: 'rgba(8, 15, 22, 0.9)', padding: 30, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b', width: '90%', maxWidth: 420, boxShadow: '0 0 30px rgba(0,0,0,0.6)' },
  authTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  authTitleCenter: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  otpSubText: { color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },

  inputWrapper: { marginBottom: 14 },
  inputLabel: { color: '#9ca3af', fontSize: 12, marginBottom: 6 },
  inputField: { backgroundColor: '#04080c', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', fontSize: 13 },
  strengthBarBg: { height: 3, backgroundColor: '#111827', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  strengthBarFill: { height: '100%', borderRadius: 2 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: '#38bdf8' },
  checkboxActive: { backgroundColor: '#38bdf8' },

  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginVertical: 20 },
  otpBoxGlow: { width: 44, height: 50, backgroundColor: '#04080c', borderRadius: 8, borderWidth: 1, borderColor: '#10b981', color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },

  chatHeader: { padding: 14, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, alignSelf: 'center', width: '100%' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  boltIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  boltText: { color: '#09090b', fontWeight: 'bold', fontSize: 16 },
  adminBadgeBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  modelBar: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 12, backgroundColor: 'rgba(8, 15, 22, 0.6)', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)', maxWidth: 1100, alignSelf: 'center', width: '100%' },
  modelChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modelChipActive: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)' },

  msgBox: { padding: 12, marginVertical: 4, borderRadius: 10, maxWidth: '82%' },
  userBox: { backgroundColor: '#059669', alignSelf: 'flex-end' },
  aiBox: { backgroundColor: 'rgba(8, 15, 22, 0.8)', alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },

  bottomBarCenter: { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 12, width: '100%', maxWidth: 1100, alignSelf: 'center' },
  inputInnerRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: 'rgba(8, 15, 22, 0.8)', color: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', fontSize: 13 },
  sendBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#090d12', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', maxWidth: 500, alignSelf: 'center', width: '100%' },
  modalArea: { backgroundColor: '#04080c', color: '#fff', padding: 10, borderRadius: 8, height: 90, textAlignVertical: 'top', borderWidth: 1, borderColor: '#1e293b' },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1e293b' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }
});
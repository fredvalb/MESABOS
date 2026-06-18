import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Linking, Alert, StyleSheet, StatusBar, SectionList, Dimensions
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';

const PICKER_HEIGHT = Dimensions.get('window').height * 0.7;
const STORAGE_KEY = 'mesabos_subscriptions';
const PREMIUM_KEY = 'mesabos_premium';
const FREE_LIMIT = 8;
const UNLOCK_PRODUCT_ID = 'mesabos_unlock_unlimited';

const SERVICES_DB = [
  { name: 'Netflix', url: 'https://www.netflix.com/cancelplan', color: '#E50914', category: 'Streaming', icon: 'N' },
  { name: 'Disney+', url: 'https://www.disneyplus.com/fr-fr/account/subscription', color: '#113CCF', category: 'Streaming', icon: 'D' },
  { name: 'Amazon Prime', url: 'https://www.amazon.fr/manageyourprime', color: '#FF9900', category: 'Streaming', icon: 'A' },
  { name: 'Canal+', url: 'https://www.canalplus.com/mon-compte/mon-abonnement', color: '#000000', category: 'Streaming', icon: 'C' },
  { name: 'YouTube Premium', url: 'https://www.youtube.com/paid_memberships', color: '#FF0000', category: 'Streaming', icon: 'Y' },
  { name: 'Spotify', url: 'https://www.spotify.com/fr/account/subscription/', color: '#1DB954', category: 'Musique', icon: 'S' },
  { name: 'Apple Music', url: 'https://music.apple.com/account/subscriptions', color: '#FA243C', category: 'Musique', icon: 'A' },
  { name: 'Deezer', url: 'https://www.deezer.com/account/subscription', color: '#FF0000', category: 'Musique', icon: 'D' },
  { name: 'Orange', url: 'https://espace-client.orange.fr', color: '#FF7900', category: 'Telephonie', icon: 'O' },
  { name: 'SFR', url: 'https://www.sfr.fr/espace-client/', color: '#CC0000', category: 'Telephonie', icon: 'S' },
  { name: 'RED by SFR', url: 'https://www.sfr.fr/espace-client/', color: '#CC0000', category: 'Telephonie', icon: 'R' },
  { name: 'Bouygues Telecom', url: 'https://www.bouyguestelecom.fr/forfaits-mobiles/resiliation', color: '#0066CC', category: 'Telephonie', icon: 'B' },
  { name: 'Free Mobile', url: 'https://mobile.free.fr/moncompte/', color: '#CC0000', category: 'Telephonie', icon: 'F' },
  { name: 'La Poste Mobile', url: 'https://www.lapostemobile.fr/mon-compte', color: '#FFCC00', category: 'Telephonie', icon: 'P' },
  { name: 'Sosh', url: 'https://www.sosh.fr/sosh-et-moi', color: '#000000', category: 'Telephonie', icon: 'S' },
  { name: 'B&You', url: 'https://www.bouyguestelecom.fr/byou', color: '#0066CC', category: 'Telephonie', icon: 'B' },
  { name: 'NRJ Mobile', url: 'https://espace-client.nrjmobile.fr', color: '#FF0033', category: 'Telephonie', icon: 'N' },
  { name: 'Coriolis Telecom', url: 'https://www.coriolis.com/espace-client', color: '#FF6600', category: 'Telephonie', icon: 'C' },
  { name: 'Cdiscount Mobile', url: 'https://www.cdiscountmobile.fr/espace-client', color: '#FF6600', category: 'Telephonie', icon: 'C' },
  { name: 'Auchan Telecom', url: 'https://www.auchan-telecom.fr/espace-client', color: '#E2001A', category: 'Telephonie', icon: 'A' },
  { name: 'Lebara', url: 'https://www.lebara.com/fr/mon-compte', color: '#00A859', category: 'Telephonie', icon: 'L' },
  { name: 'Lycamobile', url: 'https://www.lycamobile.fr/fr/my-account/', color: '#0033A0', category: 'Telephonie', icon: 'L' },
  { name: 'Prixtel', url: 'https://www.prixtel.com/espace-client', color: '#00B2A9', category: 'Telephonie', icon: 'P' },
  { name: 'YouPrice', url: 'https://www.youprice.fr/espace-client', color: '#FFCC00', category: 'Telephonie', icon: 'Y' },
  { name: 'Syma Mobile', url: 'https://www.symamobile.com/espace-client', color: '#7c3aed', category: 'Telephonie', icon: 'S' },
  { name: 'Nordnet', url: 'https://www.nordnet.com/espace-client', color: '#FF6600', category: 'Telephonie', icon: 'N' },
  { name: 'Engie', url: 'https://particuliers.engie.fr/contact/resilier-contrat-energie.html', color: '#00AAFF', category: 'Energie', icon: 'E' },
  { name: 'EDF', url: 'https://particulier.edf.fr/fr/accueil/aide-contact/resilier-contrat.html', color: '#FF6600', category: 'Energie', icon: 'E' },
  { name: 'TotalEnergies', url: 'https://www.totalenergies.fr/clients/espace-client', color: '#DA291C', category: 'Energie', icon: 'T' },
  { name: 'Ulys Vinci', url: 'https://www.ulys.vinci-autoroutes.com/espace-client', color: '#FF6600', category: 'Transport', icon: 'U' },
  { name: 'iCloud+', url: 'https://appleid.apple.com', color: '#3478F6', category: 'Stockage', icon: 'i' },
  { name: 'Google One', url: 'https://one.google.com/storage', color: '#4285F4', category: 'Stockage', icon: 'G' },
  { name: 'Dropbox', url: 'https://www.dropbox.com/account/plan', color: '#0061FF', category: 'Stockage', icon: 'D' },
  { name: 'Microsoft OneDrive', url: 'https://account.microsoft.com/services/microsoft-365', color: '#0078D4', category: 'Stockage', icon: 'O' },
  { name: 'Mega', url: 'https://mega.nz/account', color: '#D9272E', category: 'Stockage', icon: 'M' },
  { name: 'pCloud', url: 'https://www.pcloud.com/fr/my-account.html', color: '#17BCE6', category: 'Stockage', icon: 'p' },
  { name: 'Proton Drive', url: 'https://account.proton.me/u/0/drive', color: '#6D4AFF', category: 'Stockage', icon: 'P' },
  { name: 'Box', url: 'https://account.box.com/', color: '#0061D5', category: 'Stockage', icon: 'B' },
  { name: 'Backblaze', url: 'https://www.backblaze.com/user/account.html', color: '#E63946', category: 'Stockage', icon: 'B' },
  { name: 'Autre service', url: '', color: '#7c3aed', category: 'Autre', icon: '?' },
];

const CATEGORIES = ['Tous', 'Telephonie', 'Energie', 'Transport', 'Streaming', 'Musique', 'Stockage', 'Shopping', 'Autre'];

const SERVICE_SECTIONS = CATEGORIES.filter(c => c !== 'Tous')
  .map(cat => ({ title: cat, data: SERVICES_DB.filter(s => s.category === cat) }))
  .filter(section => section.data.length > 0);

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [subs, setSubs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('Tous');
  const [showModal, setShowModal] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSub, setNewSub] = useState({ name: '', category: 'Autre', amount: '', billing: 'Mensuel', nextDate: '', cancelUrl: '', icon: '?', color: '#7c3aed' });
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) setSubs(JSON.parse(stored));
      setIsLoaded(true);
    });
    AsyncStorage.getItem(PREMIUM_KEY).then(stored => {
      if (stored === 'true') setIsPremium(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  }, [subs, isLoaded]);

  const unlockPremium = () => {
    setIsPremium(true);
    AsyncStorage.setItem(PREMIUM_KEY, 'true');
    setShowPaywall(false);
  };

  useEffect(() => {
    let updateSub;
    let errorSub;
    let connected = false;
    (async () => {
      try {
        await RNIap.initConnection();
        connected = true;
        const purchases = await RNIap.getAvailablePurchases();
        if (purchases.some(p => p.productId === UNLOCK_PRODUCT_ID)) unlockPremium();

        updateSub = RNIap.purchaseUpdatedListener(async (purchase) => {
          if (purchase.productId !== UNLOCK_PRODUCT_ID) return;
          try {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            unlockPremium();
          } catch (e) {
            Alert.alert('Erreur', "L'achat n'a pas pu être finalisé.");
          }
        });
        errorSub = RNIap.purchaseErrorListener((error) => {
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Achat impossible', error.message || "Une erreur est survenue pendant l'achat.");
          }
        });
      } catch (e) {
        // IAP indisponible (Expo Go, web, ou simulateur) - le statut premium local reste valable
      }
    })();
    return () => {
      updateSub && updateSub.remove();
      errorSub && errorSub.remove();
      if (connected) RNIap.endConnection();
    };
  }, []);

  const handleUpgrade = async () => {
    try {
      await RNIap.requestPurchase({ skus: [UNLOCK_PRODUCT_ID] });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de lancer l'achat pour le moment.");
    }
  };

  const handleRestore = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases.some(p => p.productId === UNLOCK_PRODUCT_ID)) {
        unlockPremium();
        Alert.alert('Achat restauré', 'Le suivi illimité est de nouveau actif.');
      } else {
        Alert.alert('Aucun achat trouvé', "Aucun achat précédent n'a été retrouvé sur ce compte.");
      }
    } catch (e) {
      Alert.alert('Erreur', "Impossible de restaurer les achats pour le moment.");
    }
  };

  const totalMonthly = subs.reduce((acc, s) => acc + s.amount, 0);
  const totalAnnual = totalMonthly * 12;
  const filtered = filter === 'Tous' ? subs : subs.filter(s => s.category === filter);

  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const openAddModal = () => {
    if (!isPremium && subs.length >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }
    setEditingId(null);
    setNewSub({ name: '', category: 'Autre', amount: '', billing: 'Mensuel', nextDate: '', cancelUrl: '', icon: '?', color: '#7c3aed' });
    setShowModal(true);
  };

  const openEditModal = (sub) => {
    setEditingId(sub.id);
    setNewSub({ ...sub, amount: String(sub.amount) });
    setShowModal(true);
  };

  const selectService = (service) => {
    if (service.name === 'Autre service') {
      setNewSub({ ...newSub, name: '', cancelUrl: '', category: 'Autre', color: '#7c3aed', icon: '?' });
    } else {
      setNewSub({ ...newSub, name: service.name, cancelUrl: service.url, category: service.category, color: service.color, icon: service.icon });
    }
    setShowServicePicker(false);
  };

  const handleSave = () => {
    if (!newSub.name || !newSub.amount) {
      Alert.alert('Champs manquants', 'Choisis un service et indique un montant mensuel avant d\'ajouter.');
      return;
    }
    const amountNum = parseFloat(newSub.amount.replace(',', '.')) || 0;
    if (editingId) {
      setSubs(subs.map(s => s.id === editingId ? { ...newSub, id: editingId, amount: amountNum } : s));
    } else {
      setSubs([...subs, { ...newSub, id: Date.now(), amount: amountNum }]);
    }
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Retirer cet abonnement de Mes Abos ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setSubs(subs.filter(s => s.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f13" />

      <View style={styles.header}>
        <Text style={styles.logo}>Mes Abos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {[['dashboard', 'Tableau de bord'], ['list', 'Abonnements']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.tabActive]} onPress={() => setActiveTab(key)}>
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.card, { flex: 1, marginRight: 8, borderColor: '#7c3aed55' }]}>
                <Text style={styles.cardLabel}>PAR MOIS</Text>
                <Text style={styles.cardAmount}>{totalMonthly.toFixed(2)} €</Text>
                <Text style={styles.cardSub}>{subs.length} abonnement{subs.length > 1 ? 's' : ''}{!isPremium ? ` / ${FREE_LIMIT}` : ''}</Text>
              </View>
              <View style={[styles.card, { flex: 1, marginLeft: 8, borderColor: '#3b82f655' }]}>
                <Text style={[styles.cardLabel, { color: '#60a5fa' }]}>PAR AN</Text>
                <Text style={styles.cardAmount}>{totalAnnual.toFixed(2)} €</Text>
                <Text style={styles.cardSub}>{(totalAnnual / 365).toFixed(2)} €/jour</Text>
              </View>
            </View>

            {!isPremium && (
              <TouchableOpacity style={styles.premiumBanner} onPress={() => setShowPaywall(true)}>
                <Text style={styles.premiumBannerText}>Passer à l'illimité — 4,99 € (achat unique)</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Prochains prelevements</Text>
            {[...subs].sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate)).slice(0, 3).map(s => {
              const days = daysUntil(s.nextDate);
              return (
                <View key={s.id} style={styles.renewItem}>
                  <View style={[styles.iconBadge, { backgroundColor: s.color }]}>
                    <Text style={styles.iconBadgeText}>{s.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.renewName}>{s.name}</Text>
                    <Text style={[styles.renewDays, { color: days <= 3 ? '#f87171' : '#666' }]}>
                      {days <= 0 ? "Aujourd'hui !" : 'Dans ' + days + ' jour' + (days > 1 ? 's' : '')}
                    </Text>
                  </View>
                  <Text style={styles.renewAmount}>{s.amount.toFixed(2)} €</Text>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>Repartition</Text>
            {CATEGORIES.filter(c => c !== 'Tous').map(cat => {
              const catSubs = subs.filter(s => s.category === cat);
              if (!catSubs.length) return null;
              const total = catSubs.reduce((a, s) => a + s.amount, 0);
              const pct = totalMonthly > 0 ? Math.round((total / totalMonthly) * 100) : 0;
              return (
                <View key={cat} style={{ marginBottom: 12 }}>
                  <View style={styles.row}>
                    <Text style={{ color: '#ccc', fontSize: 13 }}>{cat}</Text>
                    <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '700' }}>{total.toFixed(2)} € - {pct}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: pct + '%' }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'list' && (
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} style={[styles.chip, filter === cat && styles.chipActive]} onPress={() => setFilter(cat)}>
                  <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filtered.map(s => (
              <View key={s.id} style={styles.subCard}>
                <View style={[styles.subCardBar, { backgroundColor: s.color }]} />
                <View style={[styles.iconBadge, { backgroundColor: s.color, marginRight: 12 }]}>
                  <Text style={styles.iconBadgeText}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.subName}>{s.name}</Text>
                      <Text style={styles.subCat}>{s.category} - {s.billing}</Text>
                    </View>
                    <Text style={styles.subAmount}>{s.amount.toFixed(2)} €</Text>
                  </View>
                  <View style={[styles.row, { marginTop: 10 }]}>
                    {s.cancelUrl ? (
                      <TouchableOpacity style={styles.btnCancel} onPress={() => Linking.openURL(s.cancelUrl)}>
                        <Text style={styles.btnCancelText}>Resilier</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={styles.btnEdit} onPress={() => openEditModal(s)}>
                      <Text style={styles.btnEditText}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(s.id)}>
                      <Text style={styles.btnDeleteText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {activeTab === 'list' && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>TOTAL MENSUEL</Text>
            <Text style={styles.footerAmount}>{totalMonthly.toFixed(2)} €</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>TOTAL ANNUEL</Text>
            <Text style={styles.footerAmountSub}>{totalAnnual.toFixed(2)} €</Text>
          </View>
        </View>
      )}

      {/* Modal principal ajout/edition */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { paddingBottom: 24 + insets.bottom }]}>
            <Text style={styles.modalTitle}>{editingId ? 'Modifier abonnement' : 'Nouvel abonnement'}</Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Service</Text>
              <TouchableOpacity style={styles.selectBox} onPress={() => setShowServicePicker(true)}>
                {newSub.name ? (
                  <View style={styles.row}>
                    <View style={[styles.iconBadgeSmall, { backgroundColor: newSub.color }]}>
                      <Text style={styles.iconBadgeTextSmall}>{newSub.icon}</Text>
                    </View>
                    <Text style={styles.selectBoxText}>{newSub.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.selectBoxPlaceholder}>Choisir un service...</Text>
                )}
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {newSub.category === 'Autre' || (!newSub.cancelUrl && newSub.name) ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Nom personnalise</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du service"
                  placeholderTextColor="#555"
                  value={newSub.name}
                  onChangeText={v => setNewSub({ ...newSub, name: v, icon: v.charAt(0).toUpperCase() || '?' })}
                />
              </View>
            ) : null}

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Categorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, newSub.category === cat && styles.chipActive]}
                    onPress={() => setNewSub({ ...newSub, category: cat })}
                  >
                    <Text style={[styles.chipText, newSub.category === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Montant mensuel (€)</Text>
              <TextInput
                style={styles.input}
                placeholder="9.99"
                placeholderTextColor="#555"
                keyboardType="decimal-pad"
                value={newSub.amount}
                onChangeText={v => setNewSub({ ...newSub, amount: v })}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Prochaine date de prelevement (AAAA-MM-JJ)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-07-15"
                placeholderTextColor="#555"
                value={newSub.nextDate}
                onChangeText={v => setNewSub({ ...newSub, nextDate: v })}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Lien de resiliation</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#555"
                keyboardType="url"
                value={newSub.cancelUrl}
                onChangeText={v => setNewSub({ ...newSub, cancelUrl: v })}
              />
            </View>

            <View style={styles.row}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowModal(false)}>
                <Text style={{ color: '#888', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{editingId ? 'Enregistrer' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal liste deroulante services */}
      <Modal visible={showServicePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { height: PICKER_HEIGHT, paddingBottom: 24 + insets.bottom }]}>
            <Text style={styles.modalTitle}>Choisir un service</Text>
            <SectionList
              style={{ flex: 1 }}
              sections={SERVICE_SECTIONS}
              keyExtractor={item => item.name}
              renderSectionHeader={({ section }) => (
                <Text style={styles.serviceSectionHeader}>{section.title}</Text>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.serviceRow} onPress={() => selectService(item)}>
                  <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.iconBadgeText}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.serviceRowName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              stickySectionHeadersEnabled
            />
            <TouchableOpacity style={styles.btnBack} onPress={() => setShowServicePicker(false)}>
              <Text style={{ color: '#888', fontWeight: '600', textAlign: 'center' }}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal paywall */}
      <Modal visible={showPaywall} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { paddingBottom: 24 + insets.bottom }]}>
            <Text style={styles.modalTitle}>Débloquer l'illimité</Text>
            <Text style={styles.paywallText}>
              La version gratuite est limitée à {FREE_LIMIT} abonnements suivis. Débloque le suivi illimité avec un achat unique de 4,99 €, valable à vie.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleUpgrade}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Débloquer pour 4,99 €</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSecondary, { marginTop: 12, marginRight: 0 }]} onPress={handleRestore}>
              <Text style={{ color: '#888', fontWeight: '600' }}>Restaurer mes achats</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnBack} onPress={() => setShowPaywall(false)}>
              <Text style={{ color: '#888', fontWeight: '600', textAlign: 'center' }}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1a1a2e', borderBottomWidth: 1, borderBottomColor: '#ffffff10' },
  logo: { fontSize: 20, fontWeight: '800', color: '#a78bfa' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  premiumBanner: { backgroundColor: '#7c3aed22', borderWidth: 1, borderColor: '#7c3aed55', borderRadius: 12, padding: 12, marginTop: 16, alignItems: 'center' },
  premiumBannerText: { color: '#a78bfa', fontWeight: '700', fontSize: 13 },
  paywallText: { color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', margin: 12, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  section: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 1 },
  cardLabel: { fontSize: 10, color: '#a78bfa', fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  cardAmount: { fontSize: 20, fontWeight: '800', color: '#fff' },
  cardSub: { fontSize: 10, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 11, color: '#888', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  renewItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, marginBottom: 8 },
  iconBadge: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconBadgeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  iconBadgeSmall: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  iconBadgeTextSmall: { color: '#fff', fontWeight: '800', fontSize: 12 },
  renewName: { fontWeight: '600', color: '#fff', fontSize: 14 },
  renewDays: { fontSize: 11, marginTop: 2 },
  renewAmount: { fontWeight: '700', color: '#a78bfa' },
  barBg: { height: 5, backgroundColor: '#ffffff10', borderRadius: 4, marginTop: 6 },
  barFill: { height: 5, backgroundColor: '#7c3aed', borderRadius: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1a1a2e', marginRight: 8 },
  chipActive: { backgroundColor: '#7c3aed' },
  chipText: { color: '#888', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  subCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 16, padding: 14, marginBottom: 10, overflow: 'hidden' },
  subCardBar: { width: 3, position: 'absolute', left: 0, top: 0, bottom: 0 },
  subName: { fontWeight: '700', color: '#fff', fontSize: 15 },
  subCat: { fontSize: 11, color: '#666', marginTop: 2 },
  subAmount: { fontWeight: '800', color: '#fff', fontSize: 16 },
  btnCancel: { flex: 1, padding: 7, borderRadius: 8, backgroundColor: '#3b82f611', borderWidth: 1, borderColor: '#3b82f633', alignItems: 'center', marginRight: 6 },
  btnCancelText: { color: '#60a5fa', fontWeight: '600', fontSize: 11 },
  btnEdit: { flex: 1, padding: 7, borderRadius: 8, backgroundColor: '#a78bfa11', borderWidth: 1, borderColor: '#a78bfa33', alignItems: 'center', marginRight: 6 },
  btnEditText: { color: '#a78bfa', fontWeight: '600', fontSize: 11 },
  btnDelete: { flex: 1, padding: 7, borderRadius: 8, backgroundColor: '#f8717111', borderWidth: 1, borderColor: '#f8717133', alignItems: 'center' },
  btnDeleteText: { color: '#f87171', fontWeight: '600', fontSize: 11 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a2e', borderTopWidth: 1, borderTopColor: '#ffffff15', padding: 16 },
  footerLabel: { fontSize: 10, color: '#666', letterSpacing: 1, textTransform: 'uppercase' },
  footerAmount: { fontSize: 22, fontWeight: '800', color: '#a78bfa' },
  footerAmountSub: { fontSize: 16, fontWeight: '700', color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#ffffff15', maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  input: { backgroundColor: '#0f0f13', borderWidth: 1, borderColor: '#ffffff15', borderRadius: 10, padding: 10, color: '#fff', fontSize: 14 },
  selectBox: { backgroundColor: '#0f0f13', borderWidth: 1, borderColor: '#ffffff15', borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectBoxText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  selectBoxPlaceholder: { color: '#555', fontSize: 14 },
  selectArrow: { color: '#888', fontSize: 12 },
  serviceSectionHeader: { color: '#a78bfa', fontWeight: '700', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', backgroundColor: '#1a1a2e', paddingVertical: 8 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff08' },
  serviceRowName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnSecondary: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff15', alignItems: 'center', marginRight: 8 },
  btnPrimary: { flex: 2, padding: 12, borderRadius: 12, backgroundColor: '#7c3aed', alignItems: 'center' },
  btnBack: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff15', alignItems: 'center', marginTop: 12 },
});

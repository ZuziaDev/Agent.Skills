# Anti-Pattern Katalogu — Kaciniilacak 20 Yaygin Hata

## Mimari Hatalar

**AP-01: Monolitik Ajan**
YAN: Tek ajan hem planlar hem yazar hem test eder hem deploy eder.
DOGRU: Her sorumluluk ayri ajanda.

**AP-02: Context Kalitimligi**
YANLIS: Orchestrator'in geçmisini alt-ajana geciyor.
DOGRU: Her alt-ajan sifir context'le baslar, sadece constructor'da verilen bilgiyi kullanir.

**AP-03: Shared State Cakismasi**
YANLIS: Iki ajan ayni dosyayi ayni anda duzenliyor.
DOGRU: Cakisan dosyalar icin sirali pipeline kur.

**AP-04: Missing Quality Gate**
YANLIS: Reviewer kullanmadan production'a gitmek.
DOGRU: Her kod üretimi reviewer'dan gecer.

**AP-05: Sonsuz Reviewer Döngüsü**
YANLIS: Reviewer her seferinde farkli seyler buldugundan cikis yapilmiyor.
DOGRU: max_reviewer_cycles siniri koy, sonrasinda orchestrator karar alir.

## Dispatch Hatalari

**AP-06: Paraleli Sirali Calistirmak**
YANLIS: Bagimsiz ajanlar ayri response'larda dispatch ediliyor.
DOGRU: Bagimsiz tüm dispatch'ler ayni response'da.

**AP-07: Bagimlilik Sirasini Ignorelamak**
YANLIS: B, A'dan önce basliyor ama A'nin ciktisina ihtiyaci var.
DOGRU: Bagimlilik grafini ciz, sirali asamalar olustur.

**AP-08: XL Görev**
YANLIS: "Tüm auth sistemini yeniden yaz" tek göreve veriliyor.
DOGRU: M boyutunu gec, L/XL'i parcalara böl.

**AP-09: Vague Prompt**
YANLIS: "Kodu düzelt" — ajan ne yapacagini bilmiyor.
DOGRU: Spesifik dosya, spesifik problem, beklenen cikti.

**AP-10: No Output Spec**
YANLIS: Ajana ne döndürmesi gerektigini söylemiyorsun.
DOGRU: Her prompt "Cikti: ..." bölümüyle biter.

## Memory Hatalari

**AP-11: Memory Güncellemesini Ihmal Etmek**
YANLIS: Görev bitti, memory yazilmadi.
DOGRU: Her görev sonrasi memory güncelleme zorunludur.

**AP-12: Stale Memory ile Karar Almak**
YANLIS: 3 ay önce yazilan mimari karari dogrudan kullanmak.
DOGRU: Memory'deki bilgiyi mevcut koda karsi dogrula.

**AP-13: Hassas Veri Memory'e Yazmak**
YANLIS: API key, sifreler, production URL'leri memory'e yazmak.
DOGRU: Sadece mimarı kararlar, ogrenilenler ve uyarilar.

## Kalite Hatalari

**AP-14: Test Coverage'i Ignorelamak**
YANLIS: "Zaman yok, test sonra" — coverage %30'da kaliyor.
DOGRU: %85+ hedef, gate geçilmeden sonraki asama baslamaz.

**AP-15: Mock Asiri Kullanimi**
YANLIS: Her seyi mock'lamak — entegrasyon hatalari production'a gidiyor.
DOGRU: Sadece dis servis/IO gercekten izole gerektiginde mock.

**AP-16: Snapshot Test Bagimliligı**
YANLIS: UI snapshot testleri kodu deger degisimlerini gizliyor.
DOGRU: Davranisi test et, snapshot'i değil.

## Orchestrator Hatalari

**AP-17: Orchestrator Her Seyi Kendisi Yapiyor**
YANLIS: Orchestrator kodu kendisi yaziyor, ajan dispatch etmiyor.
DOGRU: Orchestrator sadece koordine eder, is alt-ajanlara gider.

**AP-18: Hata Sonrasi Devam**
YANLIS: Ajan basarisiz oldu, orchestrator devam ediyor.
DOGRU: Hata analiz et, retry yap, gerekirse eskalasyon.

**AP-19: Review'u "Opsiyonel" Saymak**
YANLIS: "Küçük degisiklik, review gerekmez."
DOGRU: Büyüklük fark etmez, üretim kodu review'dan gecer.

**AP-20: Ekosistemi Küçük Görevler Icin Kurmak**
YANLIS: "Tek satirlik düzeltme" icin multi-agent ekosistemi kurmak.
DOGRU: Ekosistemi kompleks, cogul bagimlilikli projeler icin kur.

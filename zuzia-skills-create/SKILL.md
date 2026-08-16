---
name: zuzia-skills-create
description: Tek bir cümle veya basit bir prompt ile yeni bir skill dosyası oluşturur. Kullanıcı "X için bir skill yap" veya "/zuzia-skills-create X" dediğinde devreye girer ve gerekli SKILL.md dosyasını C:\Users\me\.claude\skills\ altına üretir.
---

# Zuzia Skills Creator

Tek satır bir açıklama veya kısa bir prompt al, eksiksiz ve çalışır bir skill oluştur.

## Ne Zaman Kullanılır

- Kullanıcı "X için skill yap" dediğinde
- `/zuzia-skills-create <açıklama>` komutu çalıştırıldığında
- "Kendine şunu yapabilen bir skill ekle: ..." şeklinde bir istek geldiğinde

## Çalışma Akışı

### 1. Girdiyi Analiz Et

Kullanıcının tek cümlelik açıklamasından şunları çıkar:

| Çıkarılacak | Soru |
|---|---|
| **İsim** | Bu skill ne yapıyor? (fiil + nesne, kebab-case) |
| **Tetikleyici** | Hangi kullanıcı ifadeleri bu skilli çağırmalı? |
| **Çıktı** | Skill ne üretir? (dosya, rapor, kod, analiz...) |
| **Adımlar** | Mantıklı bir iş akışı kaç adımdan oluşur? |

### 2. Skill Adını Üret

Kurallar:
- Tamamı küçük harf, kelimeler tire ile ayrılır: `kebab-case`
- Özlü ve açıklayıcı: `git-commit-helper`, `sql-query-builder`, `email-drafter`
- Mevcut skilllerle çakışmıyorsa `zuzia-` ön eki **ekleme** — genel isim daha iyi
- Kişisel / özel bir araçsa `zuzia-` ön eki ekle

### 3. SKILL.md İçeriğini Oluştur

Her skill dosyası aşağıdaki şablonu kullanır:

```markdown
---
name: <kebab-case-isim>
description: <Ne yapar? Hangi kullanıcı ifadeleri tetikler? — tek satır>
---

# <Başlık>

<Skill'in ne yaptığını 1-2 cümleyle özetle.>

## Ne Zaman Kullanılır

- <Tetikleyici 1>
- <Tetikleyici 2>
- <Tetikleyici 3>

## Çalışma Akışı

### 1. <Adım Adı>
<Adımda ne yapılır, hangi araçlar kullanılır.>

### 2. <Adım Adı>
<...>

### 3. Çıktı
<Kullanıcıya ne sunulur? Dosya, ekrana yazı, artifact, kod bloğu?>

## Örnekler

**Girdi:** "<Örnek kullanıcı isteği>"
**Çıktı:** <Kısa açıklama>

## İpuçları

- <Skill için önemli bir not>
- <Sınırlama veya dikkat noktası>
```

### 4. Dosyayı Yaz

Klasör yolu: `C:\Users\me\.claude\skills\<skill-adı>\SKILL.md`

### 5. Kullanıcıya Özet Sun

Skill oluşturulduktan sonra şunu göster:

```
Skill oluşturuldu: <skill-adı>
Konum: C:\Users\me\.claude\skills\<skill-adı>\SKILL.md
Kullanım: /<skill-adı> <isteğe bağlı parametre>

Tetikleyiciler:
- "<tetikleyici 1>"
- "<tetikleyici 2>"
```

## Kalite Kontrol

Oluşturmadan önce şunları doğrula:

- İsim benzersiz (C:\Users\me\.claude\skills\ içinde aynı isimde klasör yok)
- `description` frontmatter tek satır ve açıklayıcı
- Adımlar gerçekten uygulanabilir — hayali araç veya komut yok
- Çıktı bölümü kullanıcının ne göreceğini netleştiriyor
- `---` frontmatter sınırları doğru yerleştirilmiş

## Kısıtlamalar

- Skill yalnızca `C:\Users\me\.claude\skills\` altına yazılır
- Mevcut bir skill'in üzerine yazmadan önce kullanıcıya sor
- Güvenlik açığı yaratan, sistem komutlarını doğrudan çalıştıran ya da hassas veri işleyen skilleri oluşturma; bunun yerine kullanıcıyı uyar

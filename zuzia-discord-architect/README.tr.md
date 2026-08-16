# Zuzia Discord Architect

Codex için production odaklı Discord bot geliştirme skill paketidir.

Bu paket yalnızca örnek kod üretmez. Mevcut projeyi inceler, çalışma modunu seçer, gerekli intent ve izinleri çıkarır, güvenlik sınırlarını kurar, testleri çalıştırır ve yaptığı işi kanıtlarla raporlar.

## İçerik

- `SKILL.md`: Ana karar ve çalışma motoru
- `references/`: Gerektiğinde yüklenen uzmanlık belgeleri
- `scripts/inspect-project.mjs`: Proje yapısını ve riskleri analiz eder
- `scripts/verify-project.mjs`: Mevcut kalite scriptlerini güvenli sırayla çalıştırır
- `scripts/validate-skill.mjs`: Skill paketinin yapısını doğrular
- `evals/`: Skill tetikleme ve çıktı kalitesi testleri
- `assets/templates/`: Büyük projeler için isteğe bağlı şablonlar
- `agents/openai.yaml`: Codex/ChatGPT arayüz metadata dosyası

## Kurulum

### Kullanıcı genelinde

PowerShell:

```powershell
.\install.ps1
```

Linux/macOS:

```bash
chmod +x install.sh
./install.sh
```

Kurulum hedefi:

```text
~/.agents/skills/zuzia-discord-architect
```

### Projeye özel

Klasörü projenin içine kopyala:

```text
<proje>/.agents/skills/zuzia-discord-architect
```

## Kullanım

Codex içinde açık çağırma:

```text
$zuzia-discord-architect Bu projeye gelişmiş ticket, AutoMod ve AI destek sistemi ekle.
```

Skill açıklaması eşleştiğinde Codex otomatik de çağırabilir.

## Doğrulama

```bash
node scripts/validate-skill.mjs .
```

## Tasarım ilkeleri

- Mevcut projeyi körlemesine yeniden yazmaz.
- Discord izinlerini özelliklerden türetir.
- AI moderasyonunu tek karar mercii yapmaz.
- Canlı test yapılamadıysa yapılmış gibi davranmaz.
- Basit botu gereksiz mikroservis çöplüğüne dönüştürmez.

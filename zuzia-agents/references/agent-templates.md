# Ajan Prompt Sablonlari — Hizli Referans

Her sablonu kopyalayip <BURAYA> doldur.

## Orchestrator Baslatma Komutu
```
Zuzia multi-agent ekosistemi basliyor.
Proje: <PROJE_ADI>
Hedef: <NE_YAPILMAK_ISTENIYOR>
Önce Planner Ajan'i calistiriyorum.
```

## Hizli Planner Dispatch
```
Sen bir mimar ajanisin. Su projeyi analiz et:
<PROJE_ACIKLAMASI>
Görevleri JSON formatinda listele: id, title, dependencies, size (S/M/L/XL), agent tipi.
```

## Hizli Coder Dispatch
```
Görev: <BASLIK>
Dosyalar: <DOSYA_LISTESI>
Yapilacak: <ACIKLAMA>
Kısıt: Sadece listelenen dosyalari degistir. Test ekle.
Cikti: Degisiklik özeti + test sonucu.
```

## Hizli Tester Dispatch
```
Su dosya/modul icin test yaz: <HEDEF>
Framework: <JEST/PYTEST/VB>
Hedef: %85+ coverage, edge case'ler dahil.
Mock sadece gercekten gerektiginde kullan.
```

## Hizli Reviewer Dispatch
```
Su degisikligi incele: <KOD_VEYA_DIFF>
Orijinal spec: <SPEC>
ONAYLANDI veya REDDEDILDI + spesifik gerekce döndür.
```

## Hizli DevOps Dispatch
```
Ortam: <PLATFORM>
Görev: <DEPLOY_ADIMI>
Zero-downtime, rollback plani hazir olmali.
Production aksiyonlari oncesi listele ve bekle.
```

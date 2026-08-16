# Neuroa Image API Notes

Confirmed against live API on March 12, 2026.

## Base URL

`https://api.neuroa.me/v1`

## Health / discovery

- `GET /` returns API metadata and lists `/v1/images/generations`
- `GET /v1/models` lists `flux.2-klein-9b` as an image-generation model

## Image generation endpoint

`POST /v1/images/generations`

Observed working request body shape:

```json
{
  "model": "flux-schnell",
  "prompt": "tiny red square icon",
  "n": 1
}
```

Observed response shape:

```json
{
  "created": 1773276523666,
  "data": [
    {
      "url": "https://api.neuroa.me/v1/cdn/..."
    }
  ],
  "provider": "zanity"
}
```

`dall-e-3` also returned `data[0].revised_prompt`.

## Important caveat

On March 12, 2026, `GET /v1/models` listed `flux.2-klein-9b`, but a live `POST /v1/images/generations` request with that model returned:

```json
{
  "error": "Upstream provider error",
  "status": 500,
  "provider": "cloudflare",
  "message": "5007: No such model flux.2-klein-9b or task"
}
```

Treat that as a provider-side mismatch. Keep the skill default on `flux.2-klein-9b` because that is the requested target model, but surface the error clearly if it happens again.

## Auth

Use bearer auth:

```http
Authorization: Bearer <NEUROA_API_KEY>
```

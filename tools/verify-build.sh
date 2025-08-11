#!/usr/bin/env bash
set -euo pipefail

fail() { echo "[verify-build] ERROR: $*" >&2; exit 1; }

echo "[verify-build] Starting checks..."

# 1) Required directories
[ -d assets ] || fail "Missing assets/ directory"
[ -d dist ] || fail "Missing dist/ directory"

# 2) Required compiled CSS referenced by article-creation.html
CSS_REF=$(grep -Eo 'href="/article-creation/assets/[^"]+\.css"' article-creation.html | head -n1 | sed -E 's#href="/article-creation/##; s#"$##')
[ -n "${CSS_REF:-}" ] || fail "Could not find CSS href in article-creation.html"
[ -f "$CSS_REF" ] || fail "Referenced CSS not found: $CSS_REF"
echo "[verify-build] CSS OK: $CSS_REF"

# 3) Required compiled JS module referenced by article-creation.html
JS_REF=$(grep -Eo 'src="/article-creation/assets/prototype-[^"]+\.js"' article-creation.html | head -n1 | sed -E 's#src="/article-creation/##; s#"$##')
[ -n "${JS_REF:-}" ] || fail "Could not find prototype module script in article-creation.html"
[ -f "$JS_REF" ] || fail "Referenced JS not found: $JS_REF"
echo "[verify-build] JS OK: $JS_REF"

# 4) No TypeScript-only casts in HTML pages (should be plain JS)
for f in article-creation.html dist/article-creation.html; do
  if [ -f "$f" ]; then
    if grep -Eq '\sas HTML|\sas any' "$f"; then
      fail "TypeScript casts found in $f (remove 'as HTML...' or 'as any' from inline scripts)"
    fi
  fi
done
echo "[verify-build] Inline scripts OK (no TS casts)"

# 5) Dist pages exist
[ -f dist/article-creation.html ] || fail "Missing dist/article-creation.html"
[ -f dist/index.html ] || echo "[verify-build] Note: dist/index.html not found (ok if not deployed)"

echo "[verify-build] All checks passed."


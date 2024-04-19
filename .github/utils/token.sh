#!/usr/bin/env bash

base64url() {
  openssl enc -base64 -A | tr '+/' '-_' | tr -d '='
}

sign() {
  openssl dgst -binary -sha256 -sign <(printf '%s' "${PRIVATE_KEY}")
}

header="$(printf '{"alg":"RS256","typ":"JWT"}' | base64url)"
now="$(date '+%s')"
iat="$((now - 60))"
exp="$((now + (3 * 60)))"
template='{"iss":"%s","iat":%s,"exp":%s}'
payload="$(printf "${template}" "${APP_ID}" "${iat}" "${exp}" | base64url)"
echo "::add-mask::${payload}"
signature="$(printf '%s' "${header}.${payload}" | sign | base64url)"
echo "::add-mask::${signature}"
jwt="${header}.${payload}.${signature}"
echo "::add-mask::${jwt}"

installation_id="$(curl --location --silent --request GET \
  --url "${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/installation" \
  --header "Accept: application/vnd.github+json" \
  --header "X-GitHub-Api-Version: 2022-11-28" \
  --header "Authorization: Bearer ${jwt}" \
  | jq -r '.id'
)"

repo_name="$(echo "${GITHUB_REPOSITORY}" | cut -d '/' -f 2)"
token="$(curl --location --silent --request POST \
  --url "${GITHUB_API_URL}/app/installations/${installation_id}/access_tokens" \
  --header "Accept: application/vnd.github+json" \
  --header "X-GitHub-Api-Version: 2022-11-28" \
  --header "Authorization: Bearer ${jwt}" \
  --data "$(printf '{"repositories":["%s"]}' "${repo_name}")" \
  | jq -r '.token'
)"
echo "::add-mask::${token}"
echo "token=${token}" >>"${GITHUB_OUTPUT}"

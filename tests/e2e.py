#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:4173"
SCREENSHOTS = ROOT / "artifacts" / "screenshots"
RESULTS = ROOT / "artifacts" / "e2e-results.json"


def wait_for_port(host: str, port: int, timeout: float = 10.0) -> None:
    started = time.time()
    while time.time() - started < timeout:
        with socket.socket() as sock:
            sock.settimeout(0.25)
            if sock.connect_ex((host, port)) == 0:
                return
        time.sleep(0.1)
    raise RuntimeError(f"Servidor não iniciou em {host}:{port}")


def chromium_path() -> str | None:
    configured = os.getenv("CHROMIUM_PATH")
    if configured and Path(configured).exists():
        return configured
    for candidate in ["/usr/local/bin/chromium", "/usr/bin/chromium", "/usr/bin/google-chrome"]:
        if Path(candidate).exists():
            return candidate
    return shutil.which("chromium") or shutil.which("google-chrome")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def goto(page, route: str) -> None:
    page.goto(f"{BASE}/#{route}", wait_until="networkidle")
    page.wait_for_timeout(80)


def accessible_smoke(page, route: str) -> None:
    result = page.evaluate(
        """
        () => {
          const controls = [...document.querySelectorAll('input, select, textarea')]
            .filter((el) => !el.disabled && el.type !== 'hidden');
          const unlabeled = controls.filter((el) =>
            !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'));
          const namelessButtons = [...document.querySelectorAll('button')]
            .filter((el) => !el.disabled && !(el.innerText || '').trim() && !el.getAttribute('aria-label'));
          const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
          const duplicatedIds = ids.filter((id, index) => ids.indexOf(id) !== index);
          return {
            mains: document.querySelectorAll('main').length,
            headings: document.querySelectorAll('h1').length,
            unlabeled: unlabeled.map((el) => el.id || el.name || el.outerHTML.slice(0, 80)),
            namelessButtons: namelessButtons.length,
            duplicatedIds
          };
        }
        """
    )
    require(result["mains"] == 1, f"{route}: esperado exatamente um landmark main, recebido {result['mains']}")
    require(result["headings"] >= 1, f"{route}: nenhum h1 encontrado")
    require(not result["unlabeled"], f"{route}: controles sem label: {result['unlabeled']}")
    require(result["namelessButtons"] == 0, f"{route}: botão sem nome acessível")
    require(not result["duplicatedIds"], f"{route}: IDs duplicados: {result['duplicatedIds']}")


def set_plan_state(page, active: bool) -> None:
    page.evaluate(
        """
        (active) => {
          const key = 'boraestagio-mvp-state-v1';
          const current = JSON.parse(localStorage.getItem(key) || '{}');
          current.planActive = active;
          current.selectedPlanId = 'start';
          localStorage.setItem(key, JSON.stringify(current));
        }
        """,
        active,
    )


def main() -> int:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    for image in SCREENSHOTS.glob("*.png"):
        image.unlink()

    server = subprocess.Popen(
        ["node", "scripts/serve.mjs"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    console_errors: list[str] = []
    page_errors: list[str] = []
    external_requests: list[str] = []
    assertions: list[str] = []

    try:
        wait_for_port("127.0.0.1", 4173)
        with sync_playwright() as playwright:
            launch_args = {"headless": True, "args": ["--no-sandbox"]}
            executable = chromium_path()
            if executable:
                launch_args["executable_path"] = executable
            browser = playwright.chromium.launch(**launch_args)
            context = browser.new_context(
                viewport={"width": 1440, "height": 1000},
                reduced_motion="reduce",
                locale="pt-BR",
            )
            page = context.new_page()
            page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            page.on(
                "request",
                lambda request: external_requests.append(request.url)
                if not request.url.startswith(BASE) and not request.url.startswith("data:")
                else None,
            )

            # Fluxo do estudante
            page.goto(BASE, wait_until="networkidle")
            page.evaluate("localStorage.clear()")
            page.reload(wait_until="networkidle")
            expect(page.locator("h1")).to_contain_text("Seu começo")
            require(page.locator(".start-map").count() == 1, "Mapa vetorial do hero não encontrado")
            require(page.locator(".career-route-board").count() == 1, "Travessia vetorial não encontrada")
            require(page.locator(".hero img, .career-bridge img").count() == 0, "Landing ainda contém fotografias")
            assertions.append("Landing usa ilustrações vetoriais próprias, sem fotografias")
            page.locator(".role-student").click()
            expect(page).to_have_url(re.compile(r"#/estudante/cadastro$"))
            page.locator("#studentPassword").fill("SenhaFicticia#2026")
            page.locator("#studentTerms").check()
            page.get_by_role("button", name=re.compile("Salvar perfil e ver vagas")).click()
            expect(page).to_have_url(re.compile(r"#/vagas$"))
            page.locator("[data-job-search]").fill("front-end")
            expect(page.locator("[data-job-count]")).to_have_text("1")
            page.locator("[data-job-search]").fill("")
            page.locator('[data-select-job="frontend-horizonte"]').first.click()
            expect(page).to_have_url(re.compile(r"#/vagas/frontend-horizonte$"))
            page.get_by_role("link", name=re.compile("Candidatar-me gratuitamente")).click()
            expect(page).to_have_url(re.compile(r"#/candidatura/revisao$"))
            page.locator("#applicationConsent").check()
            page.get_by_role("button", name=re.compile("Confirmar candidatura")).click()
            expect(page).to_have_url(re.compile(r"#/candidatura/sucesso$"))
            expect(page.get_by_text("Candidatura concluída")).to_be_visible()
            expect(page.get_by_text("70%").first).to_be_visible()
            trigger = page.get_by_role("button", name="Conhecer")
            trigger.click()
            expect(page.locator("#bora-pro-dialog")).to_be_visible()
            page.keyboard.press("Escape")
            expect(page.locator("#bora-pro-dialog")).not_to_be_visible()
            assertions.append("Fluxo estudante concluído até confirmação, aderência e diálogo opcional")

            # Fluxo da empresa
            page.evaluate("localStorage.clear()")
            goto(page, "/")
            page.locator(".role-company").click()
            expect(page).to_have_url(re.compile(r"#/empresa/cadastro$"))
            page.locator("#companyPassword").fill("SenhaFicticia#2026")
            page.locator("#companyTerms").check()
            page.get_by_role("button", name=re.compile("Criar conta empresarial")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/vaga/nova$"))
            page.get_by_role("button", name=re.compile("Revisar vaga")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/vaga/revisao$"))
            expect(page.locator("#highlight")).not_to_be_checked()
            page.get_by_role("button", name=re.compile("Publicar gratuitamente")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/vaga/publicada$"))
            expect(page.get_by_text("Sua vaga está no ar.")).to_be_visible()
            page.get_by_role("link", name=re.compile("Acessar painel")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/candidatos$"))
            page.get_by_role("button", name=re.compile("Compatibilidade")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/upgrade$"))
            page.get_by_role("link", name=re.compile("Comparar planos")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/planos$"))
            page.get_by_role("link", name=re.compile("Continuar com Start")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/checkout$"))
            page.locator("#checkoutTerms").check()
            page.get_by_role("button", name=re.compile("Assinar por")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/plano-ativo$"))
            expect(page.get_by_text("Plano Start ativado.")).to_be_visible()
            page.get_by_role("link", name=re.compile("Usar filtros avançados")).click()
            expect(page).to_have_url(re.compile(r"#/empresa/candidatos$"))
            expect(page.get_by_text("Plano Start ativo").first).to_be_visible()
            require(page.locator("[data-locked-filter]").count() == 0, "Filtros continuaram bloqueados após ativação")
            assertions.append("Fluxo empresa concluído até compra simulada e desbloqueio")

            # Teclado e menu móvel
            page.set_viewport_size({"width": 390, "height": 844})
            goto(page, "/")
            page.keyboard.press("Tab")
            focus_state = page.evaluate(
                """
                () => {
                  const el = document.activeElement;
                  const style = getComputedStyle(el);
                  return { tag: el.tagName, text: (el.textContent || '').trim(), outline: style.outlineWidth };
                }
                """
            )
            require(focus_state["tag"] != "BODY", "Tab não moveu o foco")
            page.locator("[data-menu-toggle]").click()
            expect(page.locator("#mobile-menu")).to_be_visible()
            assertions.append("Foco por teclado e menu móvel verificados")

            # Captura das 15 telas documentais em desktop
            page.set_viewport_size({"width": 1440, "height": 1000})
            screens = [
                ("01-pagina-inicial", "/", False),
                ("02-cadastro-empresa", "/empresa/cadastro", False),
                ("03-criacao-vaga", "/empresa/vaga/nova", False),
                ("04-revisao-destaque", "/empresa/vaga/revisao", False),
                ("05-vaga-publicada", "/empresa/vaga/publicada", False),
                ("06-cadastro-estudante", "/estudante/cadastro", False),
                ("07-lista-vagas", "/vagas", False),
                ("08-detalhes-vaga", "/vagas/frontend-horizonte", False),
                ("09-revisao-candidatura", "/candidatura/revisao", False),
                ("10-candidatura-sucesso", "/candidatura/sucesso", False),
                ("11-painel-candidatos", "/empresa/candidatos", False),
                ("12-aviso-upgrade", "/empresa/upgrade", False),
                ("13-planos", "/empresa/planos", False),
                ("14-checkout", "/empresa/checkout", False),
                ("15-plano-ativo", "/empresa/plano-ativo", True),
            ]
            for name, route, active in screens:
                set_plan_state(page, active)
                # A aplicação lê o estado do localStorage no bootstrap. Recarregar
                # evita que a compra feita no fluxo anterior contamine as telas grátis.
                page.reload(wait_until="networkidle")
                goto(page, route)
                accessible_smoke(page, route)
                page.screenshot(path=SCREENSHOTS / f"{name}-1440.png", full_page=True)
            assertions.append("15 telas capturadas em 1440 px")

            # Responsividade: todas as telas, três larguras; capturas extras nas telas críticas
            responsive_routes = [route for _, route, _ in screens]
            critical = {"/", "/vagas", "/vagas/frontend-horizonte", "/candidatura/sucesso", "/empresa/candidatos", "/empresa/checkout"}
            for width, height in [(390, 844), (768, 1024), (1440, 1000)]:
                page.set_viewport_size({"width": width, "height": height})
                for route in responsive_routes:
                    set_plan_state(page, route == "/empresa/plano-ativo")
                    page.reload(wait_until="networkidle")
                    goto(page, route)
                    dimensions = page.evaluate(
                        """() => {
                          window.scrollTo(9999, 0);
                          const horizontalScroll = window.scrollX;
                          window.scrollTo(0, 0);
                          return {
                            rootScroll: document.documentElement.scrollWidth,
                            bodyScroll: document.body.scrollWidth,
                            viewport: window.innerWidth,
                            horizontalScroll,
                            rootOverflow: getComputedStyle(document.documentElement).overflowX
                          };
                        }"""
                    )
                    require(
                        dimensions["horizontalScroll"] == 0 and dimensions["bodyScroll"] <= dimensions["viewport"] + 1,
                        f"Overflow horizontal rolável em {route} a {width}px: {dimensions}",
                    )
                    if route in critical and width in (390, 768):
                        slug = route.strip("/").replace("/", "-") or "inicio"
                        page.screenshot(path=SCREENSHOTS / f"responsive-{slug}-{width}.png", full_page=True)
            assertions.append("15 rotas sem overflow em 390, 768 e 1440 px")

            # Texto ampliado como aproximação de zoom textual
            page.set_viewport_size({"width": 768, "height": 1024})
            goto(page, "/")
            page.evaluate("document.documentElement.style.fontSize = '200%'")
            expect(page.locator(".role-student")).to_be_visible()
            require(
                page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),
                "Overflow após ampliação textual a 200% na página inicial",
            )
            page.evaluate("document.documentElement.style.fontSize = ''")
            assertions.append("Página inicial permanece utilizável com texto a 200%")

            require(not console_errors, f"Erros de console: {console_errors}")
            require(not page_errors, f"Exceções de página: {page_errors}")
            require(not external_requests, f"Requisições externas inesperadas: {external_requests}")
            assertions.append("Console, exceções e rede externa sem ocorrências")

            context.close()
            browser.close()

        result = {
            "status": "passed",
            "assertions": assertions,
            "consoleErrors": console_errors,
            "pageErrors": page_errors,
            "externalRequests": external_requests,
            "screenshots": len(list(SCREENSHOTS.glob("*.png"))),
            "viewports": [390, 768, 1440],
            "browser": "Chromium",
        }
        RESULTS.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        result = {
            "status": "failed",
            "error": str(error),
            "consoleErrors": console_errors,
            "pageErrors": page_errors,
            "externalRequests": external_requests,
        }
        RESULTS.parent.mkdir(parents=True, exist_ok=True)
        RESULTS.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(result, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1
    finally:
        server.terminate()
        try:
            output, _ = server.communicate(timeout=3)
            if output:
                print(output.strip())
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    raise SystemExit(main())

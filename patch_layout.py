import base64

path = "src/app/portal-aluno/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Código do motor do relógio comprimido (Base64)
motor_b64 = "ICBjb25zdCBEQVRBX1BST1hJTUFfQVVMQSA9ICIyMDI2LTA2LTIwVDE5OjAwOjAwIjsKICBjb25zdCBbdGVtcG9SZXN0YW50ZUF1bGEsIHNldFRlbXBvUmVzdGFudGVBdWxhXSA9IHVzZVN0YXRlKDApOwogIGNvbnN0IFtmYXNlQXVsYSwgc2V0RmFzZUF1bGFdID0gdXNlU3RhdGUoJ2VzcGVyYScpOwogIHVzZUVmZmVjdCgoKSA9PiB7CiAgICBjb25zdCBjYWxjdWxhclRlbXBvID0gKCkgPT4gewogICAgICBjb25zdCBhZ29yYSA9IG5ldyREYXRlKCkuZ2V0VGltZSgpOwogICAgICBjb25zdCBob3JhcmlvQXVsYSA9IG5ldyREYXRlKERBVEFfUFJPWElNQV9BVUxBKS5nZXRUaW1lKCk7CiAgICAgIGNvbnN0IGRpZmVyZW5jYVNlZ3VuZG9zID0gTWF0aC5mbG9vcigoaG9yYXJpb0F1bGEgLSBhZ29yYSkgLyAxMDAwKTsKICAgICAgaWYgKGRpZmVyZW5jYVNlZ3VuZG9zID4gNjAwKSB7CiAgICAgICAgc2V0RmFzZUF1bGEoJ2VzcGVyYScpOwogICAgICAgIHNldFRlbXBvUmVzdGFudGVBdWxhKGRpZmVyZW5jYVNlZ3VuZG9zKTsKICAgICAgfSBlbHNlIGlmIChkaWZlcmVuY2FTZWd1bmRvcyA8PSA2MDAgJiYgZGlmZXJlbmNhU2VndW5kb3MgPj0gLTE4MDApIHsKICAgICAgICAgc2V0RmFzZUF1bGEoJ2xpYmVyYWRvJyk7CiAgICAgICAgIHNldFRlbXBvUmVzdGFudGVBdWxhKGRpZmVyZW5jYVNlZ3VuZG9zKTsKICAgICAgfSBlbHNlIHsKICAgICAgICAgc2V0RmFzZUF1bGEoJ2F0cmFzYWRvJyk7CiAgICAgICAgIHNldFRlbXBvUmVzdGFudGVBdWxhKE1hdGguYWJzKGRpZmVyZW5jYVNlZ3VuZG9zKSk7CiAgICAgIH0KICAgIH07CiAgICBjYWxjdWxhclRlbXBvKCk7CiAgICBjb25zdCBpbnRlcnZhbG8gPSBzZXRJbnRlcnZhbChjYWxjdWxhclRlbXBvLCAxMDAwKTsKICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTsKICB9LCBbXSk7CiAgY29uc3QgZm9ybWF0YXJUZW1wb0F1bGEgPSAoc2VndW5kb3MpID0+IHsKICAgIGNvbnN0IG1pbnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKHNlZ3VuZG9zKSAvIDYwKTsKICAgIGNvbnN0IHNlZ3MgPSBNYXRoLmFicyhzZWd1bmRvcykgJSA2MDsKICAgIHJldHVybiBgJHttaW5zLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06J3tzZWdzLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX1gOwogIH07"
motor_txt = base64.b64decode(motor_b64).decode('utf-8')
text = text.replace("export default function PortalAluno() {", "export default function PortalAluno() {\n" + motor_txt)

# Código do botão centralizado embutido comprimido (Base64)
botao_b64 = "ICAgICAgICAgICAgICA8ZGl2IG9uQ2xpY2s9eygpID0+IHsgaWYgKGZhc2VBdWxhICE9PSAnZXNwZXJhJykgd2luZG93Lm9wZW4oJ2h0dHBzOi8vbWVldC5nb29nbGUuY29tL2FiYy1kZWZnLWhpaicsICdfYmxhbmsnKTsgfX0gY2xhc3NOYW1lPXtgdy1mdWxsIGJnLVsjMEExMzFDXSBib3JkZXIgcm91bmRlZC0yeGwgcC0zLjUgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW4gc2hhZG93LTJ4bCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgc2VsZWN0LW5vbmUgc2hyaW5rLTAgbXQtMyAke2Zhc2VBdWxhID09PSAnZXNwZXJhJyA/ICdib3JkZXItZGFzaGVkIGJvcmRlci1zbGF0ZS03MDAgdGV4dC1zbGF0ZS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJyA6IGZhc2VBdWxhID09PSAnbGliZXJhZG8nID8gJ2JnLWVtZXJhbGQtNTAwIHRleHQtYmxhY2sgYm9yZGVyLWVtZXJhbGQtNDAwIGZvbnQtYm9sZCBjdXJzb3ItcG9pbnRlciBzaGFkb3ctWzBfMF8xNXB4X3JnYmEoMTYsMTg1LDEyOSwwLjMpXSBhbmltYXRlLXB1bHNlIGhvdmVyOmJnLWVtZXJhbGQtNjAwJyA6ICdiZy1yb3NlLTYwMCB0ZXh0LXdoaXRlIGJvcmRlci1yb3NlLTUwMCBmb250LWJvbGQgY3Vyc29yLXBvaW50ZXIgc2hhZG93LVswXzBfMTVweF9yZ2JhKDIyNSwyOSw3MiwwLjQpXSBob3ZlcjpiZy1yb3NlLTcwMCAnfX1gfT4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQtWzEwcHhdIGZvbnQtYmxhY2sgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIGZvbnQtbW9ubyAke2Zhc2VBdWxhID09PSAnbGliZXJhZG8nID8gJ3RleHQtc2xhdGUtOTAwJyA6ICd0ZXh0LXNsYXRlLTUwMCd9Y30+e2lkaW9tYSA9PT0gJ1BUJyA/ICdBVUxBIFPNTkNST05BJyA6ICdDTEFTRSBTSU5DUk9OQSd9PC9zcGFuPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXYgZmxleC1jb2wgZ2FwLTAuNSBtdC0xLjUiPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWV9e2B0ZXh0LXhzIHVwcGVyY2FzZSB0cmFja2luZy10aWdodCBmb250LWJsYWNrIGZvbnQtbW9ubyBsZWFkaW5nLXRpZ2h0IGJsb2NrICR7ZmFzZUF1bGEgPT09ICpsaWJlcmFkbyogPyAndGV4dC1ibGFjaycgOiAnJ31dfT57ZmFzZUF1bGEgPT09ICdlc3BlcmEnID8gKGlkaW9tYSA9PT0gJ1BUJyA/ICdBIHN1YSBwcvN4aW1hIGF1bGEg6SBlbTogMjAvMDYg4XMgMTk6MDAnIDogJ1R1IHBy83hpbWEgY2xhc2UgZXMgZWw6IDIwLzA2IGEgbGFzIDE5OjAwJykgOiBmYXNlQXVsYSA9PT0gJ2xpYmVyYWRvJyA/IChpZGlvbWEgPT09ICdQVCcgPyBg🚀IEVOVFJBUiBOQSBBVUxBIEFHT1JBIChGYWx0YW0gJHtmb3JtYXRhclRlbXBvQXVsYSh0ZW1wb1Jlc3RhbnRlQXVsYSl9KWAgOiBg🚀IEVOVFJBUiBBIENMQVNVIEFIT1JBIChGYWx0YW4gJHtmb3JtYXRhclRlbXBvQXVsYSh0ZW1wb1Jlc3RhbnRlQXVsYSl9KWApIDogKGlkaW9tYSA9PT0gJ1BUJyA/IGBgIFNVQSBBVUxBIEpAIENPTUVDT1UhIChBdHJhc2FkbyAke2Zvcm1hdGFyVGVtcG9BdWxhKHRlbXBvUmVzdGFudGVBdWxhKX0pYGAgOiBgYCBHVSBDTEFTRSBZQSBFTVBFWsMhIChSZXRyYXNvICR7Zm9ybWF0YXJUZW1wb0F1bGEodGVtcG9SZXN0YW50ZUF1bGEpfSlgYCl9PC9zcGFuPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWV9e2B0ZXh0LVs5cHhdIGZvbnQtYm9sZCBsZWFkaW5nLXRpZ2h0IGJsb2NrIG10LTEuNSAke2Zhc2VBdWxhID09PSAnbGliZXJhZG8nID8gJ3RleHQtc2xhdGUtODAwJyA6ICd0ZXh0LXNsYXRlLTQwMCd9Y30+e2Zhc2VBdWxhID09PSAnZXNwZXJhJyA/IChpZGlvbWEgPT09ICdQVCcgPyAnQSBlbnRyYWRhIHNlcuYgZmVpdGEgcG9yIGFsaSBtZXNtby4gTyBib3TjbyBkZSBpbmdyZXNzbyBzZXLhIGxpYmVyYWRvIDEwIG1pbnV0b3MgYW50ZXMuJyA6ICdFbCBpbmdyZXNvIHNlIGhhcuYgcG9yIGFsbO0gbWlzbW8uIEVsIGJvdMPzbiBzZSBsaWJlcmFySAxMCBtaW51dG9zIGFudGVzLicpIDogZmFzZUF1bGEgPT09ICpsaWJlcmFkbyogPyAoaWRpb21hID09PSAnUFQnID8gJ0NsaXF1ZSBwYXJhIGFicmlyIGEgc2FsYSBlIHBhcnRpY2lwYXIuJyA6ICdIYXogY2xpYyBwYXJhIGFicmlyIGxhIHNhbGEgeSBwYXJ0aWNpcGFyLicpIDogKGlkaW9tYSA9PT0gJ1BUJyA/ICdWb2PpIGVzdGEgYXRyYXNhZG8uIEFjZXNzZSBhZ29yYSBwYXJhIG7jbyBwZXJkZXIgbyByZXN0byBkYSBhdWxhIScgOiAnRXN0wXMgcmV0cmFzYWRvLiAhQWNjZWRlIGFob3JhIHBhcmEgbm8gcGVyZGVyIGVsIHJlc3RvISUpfTwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvZGl2Pg=="
botao_txt = base64.b64decode(botao_b64).decode('utf-8')

alvo_radar = '                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando...</div>\n                )}\n              </div>'
text = text.replace(alvo_radar, alvo_radar + "\n" + botao_txt)

# Remove o tracker de foguinho antigo
tracker_antigo = """            {/* TRACKER */}
            <div className="bg-[#0A131C] border border-[#1C2C39] rounded-2xl p-3 flex flex-col gap-1 shadow-2xl shrink-0">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">DAILY GOAL / STREAK TRACKER</h3>
              <div className="flex items-center gap-3 bg-[#101D28] p-2 rounded-xl border border-[#1C2C39] shadow-inner">
                <span className="text-orange-500 text-lg">🔥</span>
                <div className="flex flex-col font-mono text-xs">
                  <span className="font-black text-white">{idioma === "PT" ? "Sequência Atual: -- dias" : idioma === "ES" ? "Racha Actual: -- días" :"Current Streak: -- days"}</span>
                  <span className="text-[9px] text-slate-500 font-bold">{idioma === "PT" ? "Melhor sequência: -- dias" : idioma === "ES" ? "Mejor racha: -- días" : "Best streak: -- days"}</span>
                </div>
              </div>
            </div>"""
text = text.replace(tracker_antigo, "")

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("Injeção blindada concluída com sucesso!")

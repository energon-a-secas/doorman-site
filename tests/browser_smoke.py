"""Original cookbook UI: layout, brands, comparisons, keyboard, copy and persistence.
Run against make serve. AXE_SCRIPT optionally points to a local axe-core file.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os
out=Path(os.environ.get('AUDIT_OUTPUT','/tmp/doorman-ui-reset'));out.mkdir(parents=True,exist_ok=True)
url=os.environ.get('DOORMAN_URL','http://localhost:8849')
axe=Path(os.environ.get('AXE_SCRIPT','/tmp/doorman-audit/axe.min.js'))
errors=[];violations=[];audits=0
with sync_playwright() as p:
 b=p.chromium.launch()
 context=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 pg=context.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.goto(url,wait_until='networkidle')
 pg.locator('#s1').wait_for()
 assert pg.locator('#app > section.step').count()==6
 assert pg.locator('.workspace-nav,.plan-summary').count()==0
 assert pg.locator('.ing').count()==7
 assert pg.locator('.ing .favicon').count()==7
 assert pg.locator('.model-table tbody tr').count()==12
 assert pg.locator('.tool-item').count()==5
 assert pg.locator('[data-tier="launched"]').get_attribute('aria-pressed')=='true'
 if axe.is_file():pg.add_script_tag(path=str(axe))
 def audit(label):
  global audits
  audits+=1
  assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth'),label
  if axe.is_file():
   v=pg.evaluate("async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,message:n.failureSummary}))}))")
   if v:violations.append({'screen':label,'violations':v})
 for width in [1440,390,320]:
  pg.set_viewport_size({'width':width,'height':900})
  audit(f'{width}/overview')
  assert pg.locator('.ing__cost').first.is_visible()
  pg.locator('[data-action="toggle-cat"][data-cat="database"]').click()
  audit(f'{width}/alternatives')
  assert pg.locator('#options-database .favicon').count()>5
  pg.locator('[data-action="toggle-cat"][data-cat="database"]').click()
  pg.locator('[data-action="pin-stack"]').click()
  audit(f'{width}/comparison')
  assert pg.locator('.cmp-table').is_visible()
  pg.evaluate('window.scrollTo(0,0)')
  pg.screenshot(path=str(out/f'cookbook-{width}.png'),full_page=True)
  pg.locator('[data-action="unpin"]').click()
 # In-page navigation leaves configuration hashes intact.
 before=pg.url
 pg.locator('[data-jump="section-3"]').click()
 assert pg.evaluate('document.activeElement.id')=='s3'
 assert pg.url==before
 assert pg.locator('#section-3').evaluate('(e)=>e.getBoundingClientRect().top')>=0
 # Rerender keeps keyboard position, with fallback to the enclosing row after a swap.
 pg.set_viewport_size({'width':1440,'height':1000})
 control=pg.locator('[data-action="toggle-cat"][data-cat="database"]')
 control.focus();pg.keyboard.press('Enter')
 assert pg.evaluate('document.activeElement.dataset.cat')=='database'
 pg.locator('[data-action="pick"][data-cat="database"][data-opt="supabase"]').click()
 assert pg.evaluate('document.activeElement.dataset.cat')=='database'
 assert 'Supabase' in pg.locator('[data-action="toggle-cat"][data-cat="database"]').inner_text()
 assert 'bundled with Supabase' in pg.locator('[data-action="toggle-cat"][data-cat="auth"]').inner_text()
 pg.locator('.pricing-notes summary').click()
 pg.locator('[data-action="tier"][data-tier="scaling"]').click()
 assert pg.locator('.pricing-notes').get_attribute('open') is not None
 assert pg.evaluate('document.activeElement.dataset.tier')=='scaling'
 # Copy immediately after input uses the current value without eating the click.
 pg.evaluate('window.copied=[];Object.defineProperty(navigator,"clipboard",{value:{writeText:async t=>copied.push(t)},configurable:true})')
 pg.locator('[data-action="usage"][data-field="visitors"]').fill('4200')
 pg.locator('[data-action="copy-fit"]').click()
 assert '4200' in pg.evaluate('copied.at(-1)')
 pg.locator('[data-action="copy-prompt"]').click()
 assert 'Supabase' in pg.evaluate('copied.at(-1)')
 with pg.expect_download() as download:pg.locator('[data-action="download-prompt"]').click()
 assert 'Supabase' in Path(download.value.path()).read_text()
 # Pinning, malformed baseline input and share round trips preserve the working stack.
 pg.locator('[data-action="pin-stack"]').click()
 pg.locator('#recipe-select').select_option('content')
 assert 'SaaS Dashboard' in pg.locator('.cmp-table').locator('..').locator('..').inner_text()
 assert pg.locator('[data-tier="scaling"]').get_attribute('aria-pressed')=='true'
 pg.locator('[data-action="unpin"]').click()
 pg.locator('#compare-input').fill('not a share link')
 pg.locator('[data-action="compare-load"]').click()
 assert pg.locator('#recipe-select').input_value()=='content'
 assert pg.locator('#compare-input').input_value()=='not a share link'
 # Every original recipe and reference remains selectable with distinct examples.
 examples=set()
 recipes=pg.locator('#recipe-select option').evaluate_all('(els)=>els.map(e=>e.value)')
 for recipe in recipes:
  pg.locator('#recipe-select').select_option(recipe)
  examples.add(pg.locator('.glance__blurb').inner_text())
  assert pg.locator('.cost-table tbody tr').count()>0
 assert len(examples)==18
 for preset in pg.locator('[data-action="preset"]').evaluate_all('(els)=>els.map(e=>e.dataset.preset)'):
  pg.locator(f'[data-preset="{preset}"]').click()
  assert pg.locator(f'[data-preset="{preset}"]').get_attribute('aria-pressed')=='true'
 pg.locator('[data-preset="notion"]').click()
 pg.locator('[data-action="copy-prompt"]').click()
 assert 'text notes' in pg.evaluate('copied.at(-1)')
 pg.locator('[data-action="strategy"][data-strategy="free"]').click()
 assert pg.locator('[data-tier="hobby"]').get_attribute('aria-pressed')=='true'
 shared=context.new_page();shared.goto(pg.url,wait_until='networkidle')
 assert shared.locator('[data-preset="notion"]').get_attribute('aria-pressed')=='true'
 pg.reload(wait_until='networkidle')
 assert pg.locator('[data-preset="notion"]').get_attribute('aria-pressed')=='true'
 # Earlier planner saves open as a complete cookbook without a stranded empty screen.
 migration=b.new_context();migration.add_init_script("localStorage.setItem('doorman-cookbook-v1',JSON.stringify({recipe:'pathfinder',stage:'local',picks:{},frontend:'vanilla',tier:'hobby'}))")
 mp=migration.new_page();mp.goto(url,wait_until='networkidle')
 assert mp.locator('.ing').count()==3
 # The app is never an overly broad live region.
 assert pg.locator('#app').get_attribute('aria-live') is None
 Path(out/'accessibility-results.json').write_text(json.dumps(violations,indent=2))
 print(json.dumps({'axe_ran':axe.is_file(),'audits':audits,'violations':violations,'page_errors':errors,'recipes':len(recipes),'checks':'original layout, brand icons, mobile prices, comparisons, keyboard focus, navigation, immediate copy, downloads, all presets, saved plans and shares'},indent=2))
 b.close()
 assert not errors,errors
 assert not violations,violations

import re

with open('BLUEPRINT_Visual_Anatomia.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Emojis Module 11
text = text.replace('<span class="text-2xl drop-shadow-sm">📱</span>', '<span class="text-2xl font-black text-[#c88264]">1</span>')
text = text.replace('<span class="text-2xl drop-shadow-sm">🤖</span>', '<span class="text-2xl font-black text-[#c88264]">2</span>')
text = text.replace('<span class="text-2xl drop-shadow-sm">📝</span>', '<span class="text-2xl font-black text-[#c88264]">3</span>')
text = text.replace('<span class="text-2xl drop-shadow-sm">🗓️</span>', '<span class="text-2xl font-black text-[#c88264]">4</span>')

# Emojis Mode 05 and 12 and 11
text = text.replace('💠', '✦')
text = text.replace('🗜️', '▌')
text = text.replace('⭕', '◎')
text = text.replace('🔩', '●')
text = text.replace('☄', '✦')
text = text.replace('⚡', '▌')

with open('BLUEPRINT_Visual_Anatomia.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Emojis modernized.')

import os
import re

files = [
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(public)\tractors\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\implements\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\used-listings\enquiries\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\users\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\tractors\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\tractors\families\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\tractors\specs\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\media\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\compare\page.tsx",
    r"D:\PROJECT\TractorDost\Tractor_Dost_Client\src\app\(admin)\admin\equipment\brands\page.tsx"
]

import_stmt = "import Pagination from '@/components/shared/Pagination';\n"

for file in files:
    if not os.path.exists(file):
        print(f"File not found: {file}")
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Add Import
    if "import Pagination" not in content:
        last_import = [m for m in re.finditer(r'^import.*?;?$', content, re.MULTILINE)]
        if last_import:
            pos = last_import[-1].end()
            content = content[:pos] + "\n" + import_stmt + content[pos:]

    # 2. Fix limit state
    content = re.sub(r'const\s*\[limit\]\s*=\s*useState\((\d+)\);', r'const [limit, setLimit] = useState(\1);', content)
    if "const [limit" not in content and "const [page" in content:
        content = re.sub(r'(const\s*\[page,\s*setPage\].*)', r'\1\n  const [limit, setLimit] = useState(10);', content)

    # 3. Handle specific totalCount var
    # Sometimes it's setTotalCount, sometimes not. If we have totalCount state, we use it, otherwise we default to 0.
    has_total_count = "totalCount" in content

    replacement = f"""{{/* Pagination */}}
        <Pagination
          page={{page}}
          limit={{limit}}
          totalCount={{{ 'totalCount' if has_total_count else '100' }}}
          totalPages={{totalPages}}
          onPageChange={{setPage}}
          onLimitChange={{(l) => {{ setLimit(l); setPage(1); }}}}
        />"""

    # We can try to use a regex that matches the {/* Pagination */} block
    # It usually starts with {/* Pagination */} and ends with the div closing tag
    
    # Let's write a simple brace counter to replace the block
    start_idx = content.find('{/* Pagination */}')
    if start_idx != -1:
        # Find the next `{` which starts the condition
        cond_start = content.find('{', start_idx + 15)
        if cond_start != -1:
            # count braces
            brace_count = 1
            idx = cond_start + 1
            while brace_count > 0 and idx < len(content):
                if content[idx] == '{':
                    brace_count += 1
                elif content[idx] == '}':
                    brace_count -= 1
                idx += 1
            
            # Now we replace from start_idx to idx
            content = content[:start_idx] + replacement + content[idx:]
            
    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")

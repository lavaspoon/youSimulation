/**
 * 단일 루트 트리를 방사형(극좌표) 레이아웃으로 평탄화.
 * viewBox 좌표계 (예: 0–100), 중심 (cx, cy), 고리 간격 dr.
 * @param {{ id: string, name: string, parentId: string | null, children?: any[] }} root
 * @param {{ cx?: number, cy?: number, dr?: number }} [opts]
 */
export function computeRadialLayout(root, opts = {}) {
  const cx = opts.cx ?? 50;
  const cy = opts.cy ?? 50;
  const dr = opts.dr ?? 17;

  /** @type {{ id: string, name: string, parentId: string | null, x: number, y: number, px: number, py: number, depth: number }[]} */
  const list = [];

  function walk(n, centerAngle, angleWidth, depth, parent) {
    const r = depth * dr;
    let x;
    let y;
    if (depth === 0) {
      x = cx;
      y = cy;
    } else {
      x = cx + r * Math.cos(centerAngle);
      y = cy + r * Math.sin(centerAngle);
    }
    const px = parent?.x ?? cx;
    const py = parent?.y ?? cy;
    list.push({
      id: n.id,
      name: n.name,
      parentId: n.parentId,
      x,
      y,
      px,
      py,
      depth,
    });

    const kids = n.children || [];
    if (!kids.length) return;

    const start = depth === 0 ? -Math.PI / 2 : centerAngle - angleWidth / 2;
    const total = depth === 0 ? Math.PI * 2 : angleWidth;
    const step = total / kids.length;
    for (let i = 0; i < kids.length; i += 1) {
      const childAngle = start + step * (i + 0.5);
      const childWidth = step * 0.86;
      walk(kids[i], childAngle, childWidth, depth + 1, { x, y });
    }
  }

  walk(root, 0, Math.PI * 2, 0, null);
  return list;
}

/**
 * 루트가 여러 개일 때 가상 루트로 묶어 레이아웃 (가상 노드는 리스트에서 제외 가능).
 */
export function computeRadialLayoutFromRoots(roots, opts = {}) {
  if (!roots?.length) return [];
  if (roots.length === 1) return computeRadialLayout(roots[0], opts);
  const virtual = {
    id: '__virtual_root__',
    name: '스킬',
    parentId: null,
    children: roots,
  };
  return computeRadialLayout(virtual, opts);
}

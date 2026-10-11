// Reviewed learning steps for every visible problem. Separate from student answers.
// Each entry: Korean / English / Spanish; idea, work, finish, check.
const HINT_GUIDES = {
  P01:[
    '인덱스는 0부터 시작합니다. 배열 길이만큼 앞에서부터 검사합니다.|현재 원소와 찾는 값을 비교하고, 같으면 그 인덱스를 즉시 반환합니다.|못 찾았다는 반환은 반복문이 모두 끝난 뒤에 둡니다. 첫 원소가 다르다고 끝내면 안 됩니다.|빈 배열, 첫 원소에서 발견, 중복 값, 끝까지 없는 경우를 확인하세요.',
    'Scan indices from zero to the end.|Return the current index immediately on the first match.|Return the not-found value only AFTER the loop.|Check an empty array, the first element, duplicates, and no match.',
    'Recorre los índices desde cero hasta el final.|Devuelve el índice actual en la primera coincidencia.|Devuelve el valor de no encontrado solo DESPUÉS del bucle.|Prueba un arreglo vacío, el primer elemento, repetidos y un valor ausente.'
  ],
  P02:[
    'lo는 첫 인덱스, hi는 마지막 인덱스로 잡습니다. 양 끝을 포함하는 구간입니다.|lo≤hi인 동안 중앙을 확인합니다. 찾는 값이 더 크면 중앙 오른쪽, 더 작으면 중앙 왼쪽만 남깁니다.|이미 검사한 중앙은 새 구간에서 제외합니다. 같으면 중앙 인덱스를, 구간이 사라지면 -1을 반환합니다.|빈 배열과 원소 하나에서 끝나는지, 인덱스 대신 값을 반환하지 않는지 확인하세요.',
    'Start with an inclusive interval from the first to the last index.|While lo≤hi, compare the middle value and keep the relevant half.|Exclude the inspected middle index; return its index on a match, or -1 after the loop.|Check empty and single-element arrays; return an index, not a value.',
    'Empieza con un intervalo que incluya el primer y el último índice.|Mientras lo≤hi, compara el valor central y conserva la mitad correspondiente.|Excluye el centro ya revisado; devuelve su índice si coincide o -1 al terminar.|Prueba arreglos vacíos y de un elemento; devuelve un índice, no el valor.'
  ],
  P03:[
    '이진 탐색의 low, high와 빈 기록 목록을 준비합니다.|중앙 인덱스를 구한 직후 [low,high,mid,중앙 값]을 기록하고 나서 값을 비교합니다.|찾았으면 멈추고, 아니라면 중앙을 제외해 구간을 줄입니다. 마지막에 기록 전체를 반환합니다.|찾은 반복의 기록도 포함해야 합니다. C는 trace에 네 값을 쓰고 기록 개수를 반환합니다.',
    'Prepare low, high, and an empty trace.|Record low, high, mid, and the middle value BEFORE comparing.|Stop on a match; otherwise shrink the interval, then return the entire trace.|Include the matching iteration. In C, write four columns to trace and return its row count.',
    'Prepara low, high y un registro vacío.|Registra low, high, mid y el valor central ANTES de comparar.|Detente al encontrarlo; si no, reduce el intervalo y devuelve todo el registro.|Incluye la iteración que encuentra el valor. En C, escribe cuatro columnas y devuelve el número de filas.'
  ],
  P05:[
    '합계와 덧셈 횟수를 각각 0으로 시작합니다. sum()으로 한 번에 끝내지 않습니다.|원소 하나를 합계에 더할 때마다 횟수도 1 늘립니다.|Python은 두 값의 목록을 반환하고 C는 out[0],out[1]에 저장합니다.|0이나 음수를 더해도 덧셈 한 번입니다. 빈 배열의 두 결과는 모두 0입니다.',
    'Initialize the sum and addition count to zero; do not use sum().|Add one element and increment the count once each iteration.|Return the two values in Python; write out[0] and out[1] in C.|Zero and negative elements still count as additions; an empty input gives two zeros.',
    'Inicia suma y contador en cero; no uses sum().|Suma un elemento e incrementa el contador una vez por iteración.|En Python devuelve ambos valores; en C escribe out[0] y out[1].|Cero y los negativos también cuentan como sumas; la entrada vacía da dos ceros.'
  ],
  P06:[
    '빈 배열을 먼저 처리한 뒤 첫 원소를 최댓값 후보로 잡습니다.|두 번째 원소부터 비교합니다. 더 크면 후보를 바꾸고, 비교 횟수는 결과와 관계없이 늘립니다.|최댓값과 비교 횟수를 함께 내보냅니다. C의 빈 배열 결과는 [0,0]입니다.|음수만 있는 배열에서 초기 최댓값을 0으로 잡지 마세요. 원소 하나면 비교 0회입니다.',
    'Handle empty input first, then use the first element as the maximum.|Compare from the second element; count EVERY comparison and update only for a larger value.|Return maximum and count; C defines empty input as [0,0].|Do not initialize the maximum to zero for all-negative arrays. One element needs zero comparisons.',
    'Trata primero la entrada vacía y usa el primer elemento como máximo.|Compara desde el segundo; cuenta TODAS las comparaciones y actualiza si es mayor.|Devuelve máximo y contador; en C el vacío se define como [0,0].|No inicies en cero si todos son negativos. Un elemento requiere cero comparaciones.'
  ],
  P07:[
    '검사 횟수는 0으로 시작합니다. 앞에서부터 한 원소씩 확인합니다.|현재 값을 비교하기 직전에 횟수를 1 늘리고, 같으면 인덱스와 횟수를 함께 내보냅니다.|못 찾았다면 반복문 뒤에서 -1과 전체 검사 횟수를 내보냅니다.|인덱스 0에서 찾으면 검사 1회입니다. 반복문의 조건 검사 자체는 세지 않습니다.',
    'Start the check count at zero and scan left to right.|Increment immediately before comparing; on a match return index and count.|After an unsuccessful loop, return -1 and the total checks.|Finding index zero takes one check. Do not count loop-condition checks.',
    'Inicia el contador en cero y recorre de izquierda a derecha.|Incrementa antes de comparar; si coincide, devuelve índice y contador.|Tras un bucle sin éxito, devuelve -1 y las comprobaciones realizadas.|Encontrar el índice cero requiere una comprobación; no cuentes la condición del bucle.'
  ],
  P08:[
    '성공했을 때는 검사 횟수가 1,2,…,n으로 똑같이 가능하므로 그 평균부터 구합니다.|성공 평균에는 p를, 실패할 때의 n회에는 1-p를 곱합니다.|두 값을 더해 실수로 반환합니다. C·Java에서는 정수 나눗셈이 되지 않게 2.0으로 나눕니다.|p=0이면 항상 실패, p=1이면 성공 평균만 남는지 확인하세요.',
    'Successful searches use 1 through n checks equally often; compute that mean.|Weight this mean by p and the n checks on failure by 1-p.|Add both terms and return a floating-point value; divide by 2.0 in C/Java.|Check p=0 and p=1 separately.',
    'Si la búsqueda tiene éxito, usa de 1 a n comprobaciones con igual probabilidad.|Multiplica esa media por p y las n comprobaciones del fracaso por 1-p.|Suma ambos términos y devuelve un decimal; divide por 2.0 en C/Java.|Comprueba p=0 y p=1 por separado.'
  ],
  P09:[
    'i=1, 횟수=0에서 시작합니다. 로그 함수 없이 정수로 따라갈 수 있습니다.|i<n인 동안 i를 두 배로 하고 횟수를 1 늘립니다.|조건이 거짓이 되었을 때 횟수를 반환합니다. C는 i를 long long으로 둡니다.|n=1은 0회입니다. n이 2의 거듭제곱일 때와 그보다 1 클 때를 비교하세요.',
    'Start i at 1 and the count at zero; no logarithm is needed.|While i<n, double i and increment the count.|Return the count when the condition becomes false; use long long for i in C.|Check n=1, a power of two, and one more than that power.',
    'Empieza con i=1 y contador cero; no necesitas logaritmos.|Mientras i<n, duplica i y aumenta el contador.|Devuelve el contador al terminar; usa long long para i en C.|Prueba n=1, una potencia de dos y el número siguiente.'
  ],
  P10:[
    '남아 있는 원소 수를 n으로, 검사 횟수를 0으로 시작합니다.|원소가 남아 있는 동안 중앙을 검사했다고 세고, 가장 많이 남는 쪽의 크기인 n//2로 줄입니다.|남은 개수가 0이 되면 횟수를 반환합니다. 실제 배열을 만들 필요는 없습니다.|n=0은 0회, n=1은 1회입니다. 하나가 남은 단계도 빼먹지 마세요.',
    'Track remaining size n and a count of zero.|While size is positive, count the middle check and keep the larger half, of size n//2.|Return the count at size zero; no actual array is needed.|Check n=0 and n=1; the last single element also needs a check.',
    'Mantén el tamaño restante n y un contador cero.|Mientras quede algún elemento, cuenta la revisión del centro y conserva n//2 elementos.|Devuelve el contador al llegar a cero; no necesitas un arreglo real.|Prueba n=0 y n=1; el último elemento también se revisa.'
  ],
  P11:[
    '입력을 복사한 배열과 비교·교환 카운터 두 개를 준비합니다.|지정된 두 반복문의 범위를 지키며 이웃을 비교합니다. 비교는 항상 세고, 앞이 더 클 때만 교환과 교환 횟수를 늘립니다.|정렬 결과와 두 횟수를 내보냅니다. C는 sorted와 stats에 각각 기록합니다.|이미 정렬되었어도 조기 종료하지 않습니다. 같은 값끼리는 교환하지 않습니다.',
    'Copy the input and initialize comparison and swap counts.|Use the specified two loops; count each comparison and swap only when the left neighbor is larger.|Return the sorted copy and both counts; C writes sorted and stats.|Do not stop early on sorted input. Equal values do not swap.',
    'Copia la entrada e inicia los contadores de comparaciones e intercambios.|Usa los dos bucles indicados; cuenta cada comparación e intercambia solo si el vecino izquierdo es mayor.|Devuelve la copia ordenada y ambos contadores; C escribe sorted y stats.|No termines antes si ya está ordenado; los valores iguales no se intercambian.'
  ],
  P12:[
    'A는 n번, B는 바깥 n번마다 안쪽 n번입니다. 세 결과를 따로 계산합니다.|C의 안쪽만 먼저 세어 보세요. j=1에서 j<n인 동안 두 배로 합니다.|안쪽 횟수에 바깥 반복 n을 곱해 C의 결과를 만들고 세 결과를 순서대로 내보냅니다.|work()를 구현하지 않습니다. n=1일 때 C의 안쪽은 한 번도 실행되지 않습니다.',
    'A runs n times; B runs n inner iterations for each of n outer iterations.|For C, count the inner loop that doubles j from 1 while j<n.|Multiply this inner count by n, then output A, B, C in order.|Do not implement work(). For n=1 the inner C loop runs zero times.',
    'A se ejecuta n veces; B hace n iteraciones internas por cada una de n externas.|En C, cuenta el bucle interno que duplica j desde 1 mientras j<n.|Multiplica ese contador por n y entrega A, B y C en ese orden.|No implementes work(). Con n=1 el bucle interno de C no se ejecuta.'
  ],
  P14:[
    '약수를 담을 빈 목록을 준비하고 후보 d를 1부터 n까지 바꿉니다.|n%d가 0이면 나누어떨어지므로 그 d만 결과에 넣습니다.|후보를 작은 순서로 검사하면 결과도 오름차순입니다. C는 out에 쓰고 개수를 반환합니다.|1과 n도 약수입니다. range의 끝은 포함하지 않으므로 n까지 검사하는지 확인하세요.',
    'Prepare an empty result and test divisors from 1 through n.|Keep d exactly when n%d is zero.|Increasing candidates produce a sorted result; C writes out and returns the count.|Include 1 and n; the end of range is exclusive.',
    'Prepara un resultado vacío y prueba divisores desde 1 hasta n inclusive.|Guarda d cuando n%d sea cero.|Al probar en orden creciente, el resultado queda ordenado; C escribe out y devuelve la cantidad.|Incluye 1 y n; range no incluye el límite final.'
  ],
  P16:[
    '세 주사위의 눈을 각각 1부터 6까지 바꾸는 세 반복문을 만듭니다.|각 가장 안쪽 반복에서 세 눈의 합을 목표값과 비교합니다.|합이 같을 때만 그 순서의 세 값을 결과에 기록합니다. 주사위 순서가 다르면 다른 후보입니다.|0이나 7은 주사위 눈이 아닙니다. 가능한 합이 아닌 목표에는 빈 결과가 나와야 합니다.',
    'Use three loops, each choosing a die value from 1 to 6.|Compare their sum with the target in the innermost loop.|Record the triple only on a match; die order matters.|Do not include 0 or 7. Impossible sums produce an empty result.',
    'Usa tres bucles que elijan valores de 1 a 6 para cada dado.|Compara la suma con el objetivo en el bucle interno.|Guarda la terna solo si coincide; el orden de los dados importa.|No incluyas 0 ni 7; una suma imposible da un resultado vacío.'
  ],
  P17:[
    '세 인덱스 i,j,k로 서로 다른 카드 위치를 고릅니다.|j는 i 다음부터, k는 j 다음부터 시작하게 해서 i<j<k를 유지합니다.|그 위치의 세 값을 결과에 차례대로 넣습니다. 같은 위치 조합을 한 번만 방문합니다.|값이 같아도 서로 다른 위치의 카드는 별개입니다. 원소가 세 개 미만이면 빈 결과입니다.',
    'Choose three distinct positions i, j, k.|Start j after i and k after j so i<j<k.|Record the three values for each position combination exactly once.|Equal values at different positions are distinct cards; fewer than three elements gives no triples.',
    'Elige tres posiciones distintas i, j, k.|Empieza j después de i y k después de j, manteniendo i<j<k.|Guarda los tres valores de cada combinación de posiciones una sola vez.|Valores iguales en posiciones diferentes son cartas distintas; con menos de tres no hay ternas.'
  ],
  P20:[
    '백·십·일의 자리에 넣을 인덱스를 세 반복문으로 고릅니다.|이미 고른 인덱스는 다시 쓰지 않도록 서로 다른지 확인합니다.|세 값을 자리값 100,10,1과 곱해 하나의 후보 숫자로 만들고 결과에 넣습니다.|순서를 구별하므로 i<j<k로 제한하면 안 됩니다. 같은 카드를 두 자리에서 쓰지 마세요.',
    'Choose the hundreds, tens, and units positions with three loops.|Require three different indices.|Build a candidate using place values 100, 10, and 1, then collect it.|Order matters; do not restrict to i<j<k or reuse the same card.',
    'Elige centenas, decenas y unidades con tres bucles.|Exige tres índices diferentes.|Forma el número con valores posicionales 100, 10 y 1 y guárdalo.|El orden importa: no limites a i<j<k ni reutilices una carta.'
  ],
  P21:[
    '두 맛의 번호를 고를 두 반복문을 준비합니다.|두 번째 번호는 첫 번째 다음부터 검사해 같은 맛과 순서 뒤집기 중복을 제외합니다.|만든 메뉴를 순서대로 결과에 저장합니다. 필요한 것은 메뉴 목록이지 개수만이 아닙니다.|맛이 두 개 미만이면 빈 결과입니다. 예시의 번호가 0부터인지 확인하세요.',
    'Use two loops to choose flavor numbers.|Start the second after the first to avoid repeated flavors and reversed duplicates.|Collect the menus in order; the required result is the list, not just its size.|Fewer than two flavors gives no menus. Follow the example index convention.',
    'Usa dos bucles para elegir números de sabores.|Empieza el segundo después del primero para evitar repetir sabores y duplicados invertidos.|Guarda los menús en orden; se pide la lista, no solo su tamaño.|Con menos de dos sabores no hay menús; sigue los índices del ejemplo.'
  ],
  P25:[
    '세 곱셈 누적값을 모두 1로 시작합니다. 후보 순열을 만들 필요는 없습니다.|n!은 1부터 n까지 곱하고, 2의 n제곱과 n의 n제곱은 각각 2와 n을 n번 곱합니다.|세 정수 결과를 지정된 순서로 내보냅니다. C는 long long 누적값을 씁니다.|곱셈 초기값을 0으로 두지 마세요. C·Java의 ^는 거듭제곱이 아닙니다.',
    'Initialize three multiplication accumulators to 1; do not generate permutations.|For n!, multiply 1 through n; for the powers, multiply by 2 or n exactly n times.|Output the three integers in the specified order; use long long in C.|Zero is the wrong initial product. The ^ operator is not exponentiation in C/Java.',
    'Inicia tres productos en 1; no generes permutaciones.|Para n!, multiplica de 1 a n; para las potencias, multiplica por 2 o por n exactamente n veces.|Entrega los tres enteros en el orden indicado; usa long long en C.|No inicies el producto en cero. ^ no es potencia en C/Java.'
  ],
  P27:[
    '0부터 2의 n제곱 직전까지의 mask가 각 부분집합을 나타냅니다.|각 mask에서 합계를 0으로 다시 시작하고, 켜진 비트에 대응하는 원소만 더합니다.|합계가 target일 때 정답 개수를 1 늘리고, 모든 mask를 확인한 후 반환합니다.|mask=0은 공집합입니다. target=0일 때 이 후보도 검사해야 합니다.',
    'Each mask from 0 to 2^n-1 represents a subset.|Reset the sum for each mask and add only elements with a set bit.|Count masks whose sum equals target and return the total.|Mask zero is the empty subset; it must be checked for target=0.',
    'Cada mask de 0 a 2^n-1 representa un subconjunto.|Reinicia la suma en cada mask y suma solo los elementos con su bit activo.|Cuenta los mask cuya suma sea target y devuelve la cantidad.|El mask cero es el conjunto vacío; también se comprueba cuando target=0.'
  ],
  P28:[
    '계산한 피보나치 값을 저장할 표와, 그 표가 계산되었는지 표시할 상태를 준비합니다.|0과 1은 바로 알 수 있습니다. 그 외에는 앞 두 항을 재귀로 구하고 합을 저장합니다.|재귀 호출 전에 저장된 결과가 있으면 그것을 반환해 같은 계산을 반복하지 않습니다.|값 0은 올바른 결과이므로 미계산 표시와 구별해야 합니다. C 결과는 long long입니다.',
    'Prepare a memo table and a way to mark calculated entries.|Handle 0 and 1 directly; recursively sum the preceding two terms and store the result.|Return an existing memo value before repeating recursion.|Zero is a valid result, not an uncalculated marker. Use long long for C results.',
    'Prepara una tabla memo y una marca para las entradas calculadas.|Resuelve 0 y 1 directamente; suma recursivamente los dos términos anteriores y guarda el resultado.|Devuelve el valor guardado antes de repetir la recursión.|Cero es un resultado válido, no una marca de pendiente. Usa long long en C.'
  ],
  P29:[
    '서로 다른 세 위치를 i<j<k인 세 반복문으로 만듭니다.|가장 안쪽에서 세 원소의 합을 검사합니다.|합이 target일 때만 카운터를 늘립니다. 이 문제는 목록이 아니라 개수를 반환합니다.|중복 값도 위치가 다르면 다른 원소입니다. 세 개 미만이면 개수 0입니다.',
    'Enumerate distinct positions with three loops satisfying i<j<k.|Check the sum of the three elements in the innermost loop.|Increment only on a matching sum; return a count, not a list.|Duplicates at different positions are separate elements; fewer than three gives zero.',
    'Enumera posiciones distintas con tres bucles que cumplan i<j<k.|Comprueba la suma de los tres elementos en el bucle interno.|Incrementa solo cuando coincida; devuelve una cantidad, no una lista.|Los repetidos en posiciones distintas son elementos diferentes; con menos de tres da cero.'
  ],
  P31:[
    'i<j인 모든 위치 쌍을 배열 순서대로 방문합니다.|각 쌍에서 뒤 원소에서 앞 원소를 뺀 차이를 구합니다.|차이를 결과에 순서대로 저장합니다. 절댓값으로 바꾸는 문제가 아닙니다.|음수 차이도 그대로 남깁니다. 빈 배열이나 원소 하나에는 쌍이 없습니다.',
    'Visit every pair i<j in array order.|Subtract the earlier value from the later value.|Collect differences in order; this task does NOT ask for absolute values.|Keep negative differences. Empty or single-element input has no pairs.',
    'Visita cada par i<j en el orden del arreglo.|Resta el valor anterior al posterior.|Guarda las diferencias en orden; NO se pide valor absoluto.|Conserva diferencias negativas. Con cero o un elemento no hay pares.'
  ],
  P32:[
    '세 위치를 i<j<k로 고르며 배열 순서를 유지합니다.|세 값의 합이 target인 후보만 통과시킵니다.|통과한 세 값을 결과에 기록합니다. C는 한 행을 다 기록한 후 개수를 늘립니다.|개수만 반환하는 세 수 합 문제와 다릅니다. 요구한 것은 세 값들의 목록입니다.',
    'Choose positions i<j<k in array order.|Keep only triples whose values sum to target.|Record each triple; in C increment the count after writing its row.|This task returns triples, unlike the version that returns only their count.',
    'Elige posiciones i<j<k en el orden del arreglo.|Conserva solo las ternas cuya suma sea target.|Guarda cada terna; en C aumenta el contador después de escribir la fila.|Aquí se devuelven ternas, a diferencia de la versión que solo devuelve su cantidad.'
  ],
  P33:[
    '단어 하나마다 왼쪽 첫 문자와 오른쪽 마지막 문자를 비교합니다.|두 문자가 같으면 양쪽 인덱스를 안으로 옮깁니다. 다르면 그 단어는 제외합니다.|끝까지 모순이 없는 단어만 원래 순서대로 결과에 넣습니다.|대소문자는 다릅니다. 빈 문자열과 한 글자는 회문이며 입력의 중복도 유지합니다.',
    'For each word compare its first and last characters.|If equal move both indices inward; reject the word on a mismatch.|Keep accepted words in their original order.|Comparison is case-sensitive. Empty and one-character words are palindromes; keep duplicates.',
    'Compara el primer y el último carácter de cada palabra.|Si son iguales mueve ambos índices hacia dentro; rechaza la palabra si difieren.|Conserva las palabras aceptadas en su orden original.|Distingue mayúsculas. Vacío y un carácter son palíndromos; conserva repetidos.'
  ],
  P35:[
    '서로 다른 세 숫자를 직접 골라 후보를 만듭니다. 앞자리 0도 문자열로 보존합니다.|후보 하나를 모든 추측과 비교해 같은 위치의 숫자는 스트라이크, 다른 위치의 공통 숫자는 볼로 셉니다.|어느 추측 하나라도 개수가 다르면 후보를 버립니다. 모두 맞을 때만 전체 카운터를 늘립니다.|볼에 스트라이크를 다시 포함하지 마세요. 추측이 없으면 서로 다른 세 자리 후보가 모두 통과합니다.',
    'Choose three different digits; preserve a leading zero as text.|For each guess count same-position matches as strikes and other common digits as balls.|Reject a candidate on any inconsistent guess; count it only if every guess agrees.|Do not count strikes again as balls. Without guesses all distinct-digit candidates pass.',
    'Elige tres dígitos distintos y conserva el cero inicial como texto.|Para cada intento cuenta coincidencias de posición como strikes y otros dígitos comunes como balls.|Descarta el candidato si falla un intento; cuéntalo solo si cumple todos.|No cuentes los strikes otra vez como balls. Sin intentos pasan todos los candidatos válidos.'
  ],
  P36:[
    '합계는 0으로 두고 바깥 반복문으로 행을 고릅니다.|현재 행의 각 열을 안쪽 반복문으로 방문합니다.|각 칸의 값을 한 번씩 더한 뒤 최종 합계를 반환합니다.|행 수와 열 수를 혼동하지 마세요. 정사각형뿐 아니라 직사각형 예시도 확인합니다.',
    'Initialize the sum to zero and choose rows with an outer loop.|Visit each column of the current row with an inner loop.|Add each cell exactly once and return the sum.|Do not confuse row and column counts; check rectangular examples too.',
    'Inicia la suma en cero y elige filas con un bucle externo.|Visita las columnas de la fila actual con un bucle interno.|Suma cada celda una vez y devuelve el total.|No confundas filas y columnas; prueba también ejemplos rectangulares.'
  ],
  P37:[
    '천·백·십·일의 자리를 각각 0부터 9까지 바꾸는 네 반복문을 만듭니다.|매 후보에서 시도 횟수를 먼저 1 늘리고 네 자리 문자열을 만듭니다.|secret과 같으면 그 즉시 횟수를 반환합니다. 첫 후보 0000도 첫 시도입니다.|앞자리 0을 지우면 안 됩니다. C 문자열은 == 대신 strcmp로 내용을 비교합니다.',
    'Use four loops, one for each digit from 0 to 9.|Increment attempts for every candidate, then build its four-character text.|Return immediately on a secret match; 0000 is the FIRST attempt.|Preserve leading zeros; compare C string contents with strcmp, not ==.',
    'Usa cuatro bucles, uno por cada dígito de 0 a 9.|Incrementa los intentos para cada candidato y forma su texto de cuatro caracteres.|Devuelve el contador al coincidir; 0000 es el PRIMER intento.|Conserva ceros iniciales; compara cadenas C con strcmp, no con ==.'
  ],
  P38:[
    '결과 목록을 비우고 첫 위치 i를 차례로 고릅니다.|둘째 위치 j는 i+1부터 시작합니다. 합이 target인지 검사합니다.|같을 때만 두 값을 하나의 쌍으로 결과에 넣습니다. C는 out의 한 행을 채우고 개수를 늘립니다.|같은 위치를 두 번 고르거나 뒤집힌 쌍을 추가하지 않습니다. 중복 값은 위치별로 셉니다.',
    'Prepare an empty result and choose the first position i.|Start j at i+1 and check whether the pair sums to target.|Collect the two values only on a match; C fills one out row and increments its count.|Do not reuse one position or add reversed pairs; duplicate values count by position.',
    'Prepara un resultado vacío y elige la primera posición i.|Empieza j en i+1 y comprueba si la suma es target.|Guarda los dos valores solo si coinciden; C llena una fila de out y aumenta el contador.|No reutilices una posición ni añadas pares invertidos; los repetidos cuentan por posición.'
  ],
  P39:[
    '현재 최선의 합을 0으로 잡고 i<j<k인 세 카드 후보를 만듭니다.|세 값의 합이 target을 넘지 않는지 먼저 확인합니다.|허용된 합이 현재 최선보다 클 때만 최선을 갱신하고 마지막에 반환합니다.|target을 넘는 큰 합으로 최선을 바꾸면 안 됩니다. 고를 수 있는 세 장이 없으면 0입니다.',
    'Start best at zero and enumerate three cards with i<j<k.|First check that the sum does not exceed target.|Update best only with a larger VALID sum, then return it.|An oversized sum cannot update best. No valid three-card choice gives zero.',
    'Inicia best en cero y enumera tres cartas con i<j<k.|Comprueba primero que la suma no supere target.|Actualiza best solo con una suma VÁLIDA mayor y devuélvelo.|Una suma excesiva no actualiza best; sin elección válida de tres cartas devuelve cero.'
  ],
  P40:[
    '현재 고른 경로와 각 위치의 사용 여부를 준비합니다. 경로 길이가 r이면 복사해서 저장합니다.|사용하지 않은 위치를 고르고 사용 표시를 한 다음 재귀로 다음 자리를 채웁니다.|돌아오면 마지막 선택과 사용 표시를 모두 취소해 다음 후보를 탐색합니다.|r=0은 빈 순열 한 개입니다. 결과에 경로 자체를 넣으면 나중에 바뀌므로 복사해야 합니다.',
    'Track a path and used positions; save a COPY when its length reaches r.|Choose an unused position, mark it, and recurse for the next slot.|After returning, undo both the path choice and its used mark.|r=0 yields one empty permutation; saving the mutable path without copying is incorrect.',
    'Mantén una ruta y posiciones usadas; guarda una COPIA cuando alcance longitud r.|Elige una posición libre, márcala y llama recursivamente para el siguiente lugar.|Al volver, deshaz tanto la elección como la marca de uso.|r=0 produce una permutación vacía; guardar la ruta mutable sin copiar es incorrecto.'
  ],
  P41:[
    '현재 고른 경로와 다음 후보의 시작 인덱스를 유지합니다.|i를 골랐으면 재귀의 시작을 i+1로 넘겨 뒤쪽에서만 다음 원소를 고릅니다.|길이가 r이면 복사해서 저장하고, 재귀에서 돌아오면 마지막 선택을 뺍니다.|사용 여부 배열 없이도 인덱스가 증가해서 중복 선택을 막습니다. r=0은 빈 조합 한 개입니다.',
    'Track the current path and the next starting index.|After choosing i, recurse from i+1 so later choices come only from the right.|Save a copy at length r and remove the last choice when returning.|Increasing indices prevent repeated positions; r=0 yields one empty combination.',
    'Mantén la ruta actual y el siguiente índice inicial.|Después de elegir i, continúa desde i+1 para elegir solo a la derecha.|Guarda una copia al alcanzar r y elimina la última elección al volver.|Los índices crecientes evitan repetir posiciones; r=0 da una combinación vacía.'
  ],
  P42:[
    '패턴이 시작할 수 있는 위치는 0부터 text 길이-pattern 길이까지입니다.|각 시작 위치에서 패턴 문자를 하나씩 비교하고, 다르면 그 위치의 검사만 멈춥니다.|패턴의 모든 문자가 같을 때 시작 인덱스를 결과에 넣습니다. 다음 시작 위치도 1만 증가시킵니다.|겹치는 일치도 찾습니다. 이 문항은 빈 패턴일 때 모든 경계 위치를 반환합니다.',
    'Possible starts run from zero through text length minus pattern length.|At each start compare pattern characters; stop that check on a mismatch.|Record the start only after all characters match; advance starts by ONE.|Keep overlapping matches. An empty pattern matches every boundary position in this task.',
    'Los inicios posibles van de cero a longitud del texto menos longitud del patrón, inclusive.|Compara los caracteres en cada inicio y detén esa comprobación si difieren.|Guarda el inicio solo si coincide todo el patrón; avanza los inicios de UNO en UNO.|Incluye coincidencias superpuestas; el patrón vacío coincide en todos los límites de este ejercicio.'
  ],
  P43:[
    'i<j 순서로 모든 쌍을 검사하고 아직 최선을 고르지 않은 상태를 따로 둡니다.|각 쌍의 차이는 절댓값입니다. 처음 쌍이거나 더 작은 차이를 찾을 때만 최선을 바꿉니다.|두 값과 차이를 지정된 순서로 내보냅니다. 같은 차이에서는 먼저 찾은 쌍을 유지합니다.|C는 뺄셈 전에 long long으로 변환해야 큰 양수·음수의 차이를 안전하게 구합니다.',
    'Visit every pair i<j and track whether a best pair exists yet.|Use the absolute difference; update for the first pair or a strictly smaller difference.|Output both values and the difference; ties keep the first pair.|In C, cast BEFORE subtraction so large positive and negative values do not overflow.',
    'Visita todos los pares i<j y marca si ya existe un mejor par.|Usa la diferencia absoluta; actualiza en el primer par o con una diferencia estrictamente menor.|Entrega ambos valores y la diferencia; los empates conservan el primer par.|En C, convierte ANTES de restar para evitar desbordamiento con valores extremos.'
  ],
  P44:[
    '각 mask마다 새로운 빈 부분집합을 만듭니다.|원소 위치 j마다 mask의 j번째 비트가 켜져 있는지 검사해 해당 값만 넣습니다.|이 부분집합을 전체 결과에 넣고 다음 mask로 넘어갑니다. C는 각 행의 길이도 sizes에 씁니다.|mask=0의 빈 부분집합도 저장합니다. 서로 다른 mask를 한 목록에 계속 이어 붙이지 마세요.',
    'Create a NEW empty subset for each mask.|Check bit j of mask and include element j only when it is set.|Store this subset and move to the next mask; C also records row lengths in sizes.|Store the empty subset at mask zero. Do not append different masks into one shared row.',
    'Crea un subconjunto vacío NUEVO para cada mask.|Comprueba el bit j e incluye el elemento j solo si está activo.|Guarda ese subconjunto y continúa; C registra también las longitudes en sizes.|Guarda el subconjunto vacío del mask cero; no mezcles distintos mask en la misma fila.'
  ],
  P45:[
    '0번 도시는 이미 방문한 출발점으로 둡니다. 현재 도시·방문 수·누적 비용을 재귀 상태로 넘깁니다.|아직 방문하지 않은 도시를 하나 선택하고 그 도시까지의 비용을 더해 재귀 호출합니다.|모두 방문했으면 0으로 귀환하는 비용까지 더해 최선을 비교합니다. 돌아온 뒤 방문 표시를 취소합니다.|최근접 도시 하나만 고르면 완전 탐색이 아닙니다. 출발점 0은 다시 중간 후보로 선택하지 않습니다.',
    'Mark city 0 visited and recurse with current city, visited count, and cost.|Try EACH unvisited city and add the cost of that edge.|At full visitation add the return edge to zero, update best, and undo visit marks on return.|Choosing only the nearest city is not exhaustive search; zero is not an intermediate choice.',
    'Marca la ciudad 0 como visitada y usa ciudad actual, cantidad visitada y coste como estado.|Prueba CADA ciudad no visitada y suma el coste de su arista.|Al visitar todas añade la vuelta a cero, actualiza el mejor coste y desmarca al volver.|Elegir solo la ciudad más cercana no es búsqueda exhaustiva; cero no es una elección intermedia.'
  ],
  P46:[
    '각 mask가 어떤 물건을 고른 것인지 나타냅니다. 매 후보의 무게와 가치는 0부터 다시 더합니다.|켜진 비트의 물건만 골라 weights와 values를 각각 누적합니다.|총 무게가 capacity 이하일 때만 가치의 최선을 갱신합니다.|빈 선택도 후보입니다. 한 물건을 여러 번 쓰거나 무게와 가치를 혼동하지 마세요.',
    'Each mask is a set of selected items; reset weight and value for each candidate.|For set bits, accumulate weights and values separately.|Update best value only when total weight is within capacity.|Include the empty choice; do not reuse an item or confuse weight with value.',
    'Cada mask indica objetos elegidos; reinicia peso y valor para cada candidato.|Para los bits activos acumula pesos y valores por separado.|Actualiza el mejor valor solo si el peso total cabe en capacity.|Incluye la selección vacía; no reutilices objetos ni confundas peso y valor.'
  ],
  P51:[
    '현재 두 수 a,b를 유지합니다. b가 0이면 반복을 끝냅니다.|a를 b로 나눈 나머지를 먼저 임시 변수에 저장합니다.|a에는 이전 b를, b에는 방금 저장한 나머지를 넣어 반복합니다. 종료 시 a가 답입니다.|a를 먼저 덮어쓴 뒤 a%b를 계산하면 이전 값이 사라집니다. b=0인 첫 입력도 확인하세요.',
    'Maintain a and b; stop when b is zero.|Compute the remainder of the OLD a divided by b first.|Assign the old b to a and the saved remainder to b; return a at termination.|Do not overwrite a before computing its remainder. Check an initial b=0.',
    'Mantén a y b y termina cuando b sea cero.|Calcula primero el resto del a ANTERIOR dividido entre b.|Pon el antiguo b en a y el resto guardado en b; devuelve a al terminar.|No sobrescribas a antes de calcular el resto; prueba también b=0 inicial.'
  ],
  P53:[
    '두 번째 원소부터 현재 값을 key에 보관합니다. 앞쪽은 이미 정렬된 구간입니다.|앞 원소가 key보다 큰 동안 한 칸 오른쪽으로 밀고 왼쪽으로 이동합니다.|멈춘 다음 빈 자리에 key를 넣습니다. 새 정렬 배열을 반환하는 대신 원래 배열을 바꿉니다.|동일한 값은 밀지 않습니다. 인덱스가 음수가 아닌지 먼저 검사한 뒤 배열을 읽으세요.',
    'From the second element, save the current value as key; the prefix is already sorted.|Shift larger preceding elements right while moving left.|Place key in the resulting gap; modify the original array.|Do not shift equal values. Check the index is nonnegative BEFORE accessing it.',
    'Desde el segundo elemento guarda el valor en key; el prefijo ya está ordenado.|Desplaza a la derecha los anteriores mayores mientras avanzas a la izquierda.|Coloca key en el hueco y modifica el arreglo original.|No desplaces valores iguales; comprueba el índice no negativo ANTES de leerlo.'
  ],
  P54:[
    'k는 1부터 세는 순위이므로 목표 인덱스는 k-1입니다.|피벗으로 구간을 분할해 피벗의 최종 위치 p를 얻습니다. 라이브러리로 전체 정렬하지 않습니다.|p가 목표면 답을 반환하고, 아니라면 목표가 있는 한쪽만 남겨 반복합니다.|중복도 각각 한 원소로 셉니다. 피벗 위치 자체를 다음 구간에 포함하면 진행하지 않을 수 있습니다.',
    'k is a one-based rank, so the target index is k-1.|Partition the interval around a pivot and obtain its final position p.|Return on the target position; otherwise continue ONLY in the half containing the target.|Count duplicates separately. Exclude p from the next interval; do not sort the entire array.',
    'k es un rango desde uno, así que el índice objetivo es k-1.|Divide el intervalo con un pivote y encuentra su posición final p.|Si p es el objetivo devuelve el valor; si no, continúa SOLO en la mitad correspondiente.|Cuenta los repetidos por separado; excluye p del siguiente intervalo y no ordenes todo.'
  ],
  P55:[
    'n=0과 n=1을 먼저 처리합니다. 그 외에는 직전 두 피보나치 값을 유지합니다.|새 값은 기존 두 값의 합으로 계산해 임시 변수에 저장합니다.|그 뒤에만 두 변수를 한 칸씩 이동시킵니다. F(2)부터 F(n)까지 계산한 최종 값을 반환합니다.|C·Java에서 a=b를 먼저 실행하면 이전 a를 잃습니다. 큰 피보나치는 64비트 정수로 계산합니다.',
    'Handle n=0 and n=1 first; otherwise track the previous two terms.|Compute their sum into a temporary variable BEFORE changing either term.|Shift the two terms and repeat from F(2) through F(n), then return the last value.|Assigning a=b first loses the old a in C/Java. Use 64-bit integers for large terms.',
    'Resuelve n=0 y n=1 primero; después conserva los dos términos anteriores.|Calcula su suma en una variable temporal ANTES de modificar ninguno.|Avanza ambos términos desde F(2) hasta F(n) y devuelve el último valor.|Asignar a=b primero pierde el a anterior en C/Java; usa enteros de 64 bits para términos grandes.'
  ],
  P56:[
    '찾을 구간은 [lo,hi)입니다. hi는 포함하지 않으며 처음에는 전체 배열입니다.|왼쪽 절반의 합을 직접 구합니다. 모두 1이라면 합은 그 절반의 원소 수와 같습니다.|합이 그 개수보다 작으면 0이 왼쪽에, 같으면 오른쪽에 있으므로 그쪽으로 범위를 줄입니다.|원소 하나가 남으면 그 위치를 반환합니다. n=1에서도 추가 접근 없이 끝나야 합니다.',
    'Use a half-open interval [lo,hi), initially the whole array.|Sum the left half; if every value is 1, the sum equals its size.|A smaller sum puts zero on the left; an equal sum puts it on the right. Keep that half.|Return the remaining index when one element remains; n=1 needs no extra access.',
    'Usa [lo,hi), sin incluir hi, al principio todo el arreglo.|Suma la mitad izquierda; si todos son 1, la suma coincide con su tamaño.|Una suma menor sitúa el cero a la izquierda; una igual, a la derecha. Conserva esa mitad.|Devuelve el índice al quedar un elemento; n=1 no requiere lecturas adicionales.'
  ],
  P57:[
    'i,j는 두 배열에서 아직 넣지 않은 첫 원소를 가리킵니다. 결과 목록은 비워 둡니다.|양쪽에 원소가 남아 있으면 두 값을 비교하고 작은 쪽을 넣은 뒤 그쪽 인덱스만 늘립니다.|한쪽이 끝나면 다른 쪽의 남은 원소를 반복문으로 하나씩 이어 넣습니다.|같은 값이면 왼쪽 a를 먼저 넣습니다. append는 원소 하나를 넣는 함수이며 extend 없이도 됩니다.',
    'i and j point to the first unused elements; start with an empty result.|While both sides have elements, append the smaller value and advance ONLY that side.|When one side ends, copy the other remainder one element at a time.|Take from a first on equality. append adds one element; extend is unnecessary.',
    'i y j señalan los primeros elementos pendientes; empieza con un resultado vacío.|Mientras queden ambos lados, añade el menor y avanza SOLO ese lado.|Cuando termine un lado, copia el resto del otro elemento por elemento.|En igualdad toma primero de a; append añade un elemento y no necesitas extend.'
  ],
  P58:[
    '길이가 0 또는 1이면 더 나누지 않고 종료합니다.|중앙에서 둘로 나누고 양쪽을 각각 병합 정렬합니다. 재귀 호출이 정렬된 결과를 만들 때까지 기다립니다.|두 정렬 결과를 병합합니다. Python의 merge_arrays는 제공되며 C는 tmp에 병합한 뒤 a로 복사합니다.|C는 [lo,hi)라서 hi를 포함하지 않습니다. 퀵 정렬의 [lo,hi]와 혼동하지 마세요.',
    'Stop splitting at length zero or one.|Split at the middle and recursively sort BOTH halves.|Merge their sorted results. Python has merge_arrays; C merges into tmp then copies back to a.|C uses [lo,hi), excluding hi; do not confuse it with quick sort bounds.',
    'Deja de dividir con longitud cero o uno.|Divide por el centro y ordena recursivamente AMBAS mitades.|Combina los resultados; Python dispone de merge_arrays y C combina en tmp y copia a a.|C usa [lo,hi), sin hi; no confundas los límites con quick sort.'
  ],
  P59:[
    '왼쪽에서는 mid-1부터 lo 방향으로 누적합을 늘리며 그중 가장 큰 합을 기억합니다.|오른쪽에서는 mid부터 hi 직전까지 같은 방식으로 가장 큰 누적합을 구합니다.|왼쪽의 최고 누적합과 오른쪽의 최고 누적합을 더합니다. 둘 다 경계에 붙은 구간입니다.|양쪽에서 한 원소 이상 골라야 하므로 최선의 초기값을 0으로 두지 않습니다. 전부 음수인 예시도 보세요.',
    'Scan left from mid-1 toward lo, tracking the best running sum.|Scan right from mid through hi-1 and track its best running sum.|Add the two best sums; both chosen segments touch the boundary.|Each side must contribute an element; do not initialize best to zero for negative-only input.',
    'Recorre desde mid-1 hacia lo y conserva la mejor suma acumulada izquierda.|Recorre desde mid hasta hi-1 y conserva la mejor suma derecha.|Suma ambos máximos; ambos segmentos tocan la frontera.|Cada lado aporta al menos un elemento; no inicies el máximo en cero si todos son negativos.'
  ],
  P60:[
    '원소 하나면 그 값 자체가 답입니다. 빈 구간은 후보가 아닙니다.|중앙으로 나눠 왼쪽 내부의 최고합과 오른쪽 내부의 최고합을 재귀로 구합니다.|제공된 cross_sum으로 경계를 넘는 최고합도 구해 세 후보 중 가장 큰 값을 반환합니다.|left와 right의 결과는 각각 전체 절반의 합이 아니라 그 절반 안의 최대 연속합입니다.',
    'One element returns its own value; empty segments are not candidates.|Recursively find the best subarray INSIDE each half.|Use provided cross_sum for the crossing candidate and return the greatest of the three.|Left and right results are best subarray sums, not sums of entire halves.',
    'Un elemento devuelve su valor; los segmentos vacíos no son candidatos.|Busca recursivamente la mejor suma de subarreglo DENTRO de cada mitad.|Usa cross_sum para la candidata que cruza y devuelve la mayor de las tres.|Los resultados izquierdo y derecho no son sumas de mitades completas.'
  ],
  P89:[
    'b=0이면 1%m을 반환하는 종료 조건을 먼저 둡니다.|b//2에 대한 재귀 결과를 딱 한 번 구해 half에 저장하고 제곱합니다.|b가 홀수일 때만 a를 한 번 더 곱합니다. 곱할 때마다 나머지를 취합니다.|같은 절반 재귀를 두 번 부르지 않습니다. m=1은 결과 0이고 C의 중간 곱셈은 long long입니다.',
    'Handle b=0 by returning 1%m.|Compute the recursive result for b//2 ONCE into half, then square it.|Multiply by a once more only for odd b; apply modulo after each product.|Do not duplicate the half recursion. m=1 gives zero; C intermediate products need long long.',
    'Para b=0 devuelve 1%m.|Calcula UNA vez el resultado recursivo para b//2 en half y elévalo al cuadrado.|Multiplica otra vez por a solo si b es impar; aplica módulo tras cada producto.|No dupliques la recursión de la mitad; m=1 da cero y los productos C requieren long long.'
  ],
  P62:[
    '현재 정사각형은 시작 행 r, 시작 열 c, 한 변 n으로 정해집니다. 모든 칸이 첫 칸과 같은지 검사합니다.|전부 같으면 문자 0 또는 1 하나로 끝냅니다. 다르면 한 변을 절반으로 줄여 네 칸 영역을 재귀 호출합니다.|왼위·오른위·왼아래·오른아래 결과를 이 순서로 붙이고 바깥을 괄호로 감쌉니다.|n=1은 반드시 단색입니다. C는 out에 문자와 끝의 null 문자를 쓰고 *p를 출력 위치로 사용합니다.',
    'r, c, n define the square; compare every cell with its first cell.|If uniform return one digit; otherwise halve the side and recursively encode four quadrants.|Join top-left, top-right, bottom-left, bottom-right in that order inside parentheses.|n=1 is always uniform. C writes characters to out, terminates the string, and advances *p.',
    'r, c y n definen el cuadrado; compara todas sus celdas con la primera.|Si es uniforme devuelve un dígito; si no, reduce el lado a la mitad y codifica cuatro cuadrantes.|Une superior izquierdo, superior derecho, inferior izquierdo e inferior derecho entre paréntesis.|n=1 siempre es uniforme. C escribe en out, termina la cadena y avanza *p.'
  ],
  P87:[
    '가운데 원소를 hi로 옮겨 피벗을 보관합니다. L은 lo, R은 hi-1에서 출발합니다.|L은 피벗 이하인 동안 오른쪽으로, R은 피벗보다 큰 동안 왼쪽으로 이동합니다. 읽기 전에 L≤R을 확인합니다.|교차하지 않았으면 잘못 놓인 두 값을 교환해 반복합니다. 교차하면 a[L]과 끝 피벗을 바꾸고 L을 반환합니다.|양 끝을 포함한 구간입니다. 가운데 피벗 대신 다른 분할 규칙을 쓰면 같은 중간 배열이 나오지 않습니다.',
    'Move the middle element to hi as pivot; start L=lo and R=hi-1.|Advance L past values ≤pivot and R past values >pivot, checking L≤R BEFORE access.|Swap misplaced values until pointers cross; then swap a[L] with the end pivot and return L.|Both endpoints are included. A different partition rule may produce the wrong intermediate array.',
    'Mueve el elemento central a hi como pivote; inicia L=lo y R=hi-1.|Avanza L por valores ≤pivote y R por valores >pivote, comprobando L≤R ANTES de leer.|Intercambia los mal colocados hasta cruzarse; cambia a[L] con el pivote final y devuelve L.|Ambos extremos se incluyen; otra regla puede producir un arreglo intermedio incorrecto.'
  ],
  P88:[
    'lo≥hi면 정렬할 원소가 한 개 이하이므로 바로 종료합니다.|제공된 partition을 한 번 호출해 피벗의 확정 위치 p를 받습니다.|피벗을 제외한 [lo,p-1]과 [p+1,hi]를 각각 재귀 정렬합니다. 원래 배열을 수정합니다.|전체 첫 호출의 hi는 n-1입니다. 빈 배열은 hi=-1이며 피벗을 읽기 전에 종료해야 합니다.',
    'Return immediately when lo≥hi.|Call the PROVIDED partition once for the fixed pivot index p.|Recursively sort [lo,p-1] and [p+1,hi], modifying the original array.|The initial hi is n-1; empty input has hi=-1 and must return before reading a pivot.',
    'Termina inmediatamente si lo≥hi.|Llama UNA vez a partition, que se proporciona, para obtener el índice p.|Ordena recursivamente [lo,p-1] y [p+1,hi], modificando el arreglo original.|El hi inicial es n-1; para vacío es -1 y debes terminar antes de leer el pivote.'
  ],
  P65:[
    '현재 정사각형의 모든 칸이 같은지 먼저 검사합니다.|단색 1이면 한 조각, 단색 0이면 0조각입니다. 칸 수 n*n을 반환하는 문제가 아닙니다.|혼합 영역일 때만 네 등분해 각각의 조각 수를 더합니다.|최종 단색 영역을 세는 문제입니다. 1이 네 칸 붙어 한 단색 영역이면 조각 하나로 셉니다.',
    'First check whether the current square is uniform.|Uniform 1 contributes ONE piece; uniform 0 contributes zero, not n*n.|Only mixed squares split into four, whose counts are added.|Count final uniform regions, not individual cells.',
    'Comprueba primero si el cuadrado actual es uniforme.|Un área uniforme de 1 aporta UNA pieza y una de 0 aporta cero, no n*n.|Solo las áreas mixtas se dividen en cuatro y suman sus cantidades.|Cuenta regiones uniformes finales, no celdas individuales.'
  ],
  P66:[
    '역전 쌍은 앞의 수가 뒤의 수보다 큰 경우입니다. 왼쪽 a의 원소가 오른쪽 b보다 먼저 있던 것이므로 a[i]>b[j]인 쌍을 셉니다. i,j,count를 0으로 시작합니다.|a[i]<=b[j]이면 그 a[i]는 현재 b[j]와 그 뒤의 어떤 원소보다도 크지 않습니다. 더 큰 왼쪽 원소를 확인하려고 i만 늘립니다.|a[i]>b[j]이면 a가 정렬되어 있어 a[i]부터 끝까지 모두 b[j]보다 큽니다. len(a)-i개를 한 번에 더하고 j만 늘립니다. 예: 남은 a가 [4,7], b[j]=2이면 2쌍입니다.|같은 값은 세지 않습니다. a=[1,4,7], b=[2,3,8]의 네 쌍은 (4,2),(7,2),(4,3),(7,3)입니다. 한쪽이 비면 0입니다.',
    'An inversion has an earlier value larger than a later one. Every a value originally preceded every b value, so count a[i]>b[j]; start i,j,count at zero.|If a[i]<=b[j], that a[i] cannot exceed b[j] or any later b value; advance only i.|Otherwise all remaining sorted a values exceed b[j]. Add a.length-i (len(a)-i in Python) and advance only j; [4,7] against 2 makes two pairs.|Equal values do not count. [1,4,7] against [2,3,8] gives (4,2),(7,2),(4,3),(7,3). An empty side gives zero.',
    'Una inversión tiene un valor anterior mayor que uno posterior. Todo valor de a precedía a los de b, así que cuenta a[i]>b[j]; inicia i,j,count en cero.|Si a[i]<=b[j], ese a[i] no supera a b[j] ni a los siguientes valores de b; avanza solo i.|Si no, todos los valores restantes de a superan a b[j]. Suma a.length-i (len(a)-i en Python) y avanza solo j; [4,7] frente a 2 forma dos pares.|Los valores iguales no cuentan. [1,4,7] frente a [2,3,8] da (4,2),(7,2),(4,3),(7,3). Si un lado está vacío, devuelve cero.'
  ],
  P67:[
    '동전 종류를 500,100,50,10,1 순서로 확인합니다.|남은 금액을 현재 동전으로 나눈 몫은 사용할 개수입니다. 그 개수를 카운터에 더합니다.|나머지만 다음 작은 동전으로 넘깁니다. 마지막까지 처리한 개수를 반환합니다.|동전 하나마다 반복할 필요는 없습니다. amount=0일 때는 0개이며 이 문제의 화폐 종류에만 적용합니다.',
    'Process denominations 500,100,50,10,1 in order.|The quotient of remaining amount by the current coin is the number to add.|Pass only the remainder to the next coin and return the total count.|Do not loop once per individual coin. Zero amount uses no coins; this reasoning uses these denominations.',
    'Procesa las monedas 500,100,50,10,1 en orden.|El cociente del importe restante entre la moneda es la cantidad que debes añadir.|Pasa solo el resto a la siguiente moneda y devuelve el total.|No repitas por cada moneda individual; importe cero usa ninguna y el razonamiento depende de estas monedas.'
  ],
  P68:[
    '활동은 종료 시각 순으로 이미 정렬되어 있습니다. 마지막 선택의 종료 시각과 개수를 관리합니다.|현재 시작 시각이 마지막 종료 시각 이상일 때만 활동을 선택합니다.|선택한 경우에만 개수를 늘리고 마지막 종료 시각을 바꿉니다.|끝나는 순간 바로 시작하는 다음 활동도 허용됩니다. 거절한 활동으로 last를 바꾸지 마세요.',
    'Activities are ALREADY sorted by finish time; track last finish and selected count.|Accept an activity when its start is at least the last selected finish.|Only accepted activities update the count and last finish.|Touching endpoints are allowed. Rejected activities must not change last.',
    'Las actividades YA están ordenadas por finalización; conserva último final y cantidad elegida.|Acepta si su inicio es al menos el último final seleccionado.|Solo las aceptadas actualizan contador y último final.|Se permiten extremos contiguos; las rechazadas no cambian last.'
  ],
  P69:[
    '물건은 가치/무게가 큰 순서로 이미 주어집니다. 현재 용량과 누적 실수 가치를 관리합니다.|담을 무게는 물건 전체 무게와 남은 용량 중 작은 쪽입니다.|담은 비율만큼 가치를 더하고 남은 용량을 줄입니다. 용량이 0이면 멈춥니다.|C·Java의 take/weight가 정수 나눗셈이 되지 않게 실수로 계산합니다. 물건을 쪼갤 수 있는 문제입니다.',
    'Items ALREADY arrive by decreasing value/weight; track capacity and floating value.|Take the smaller of item weight and remaining capacity.|Add the proportional value, reduce capacity, and stop at zero capacity.|Avoid integer division in C/Java; this task allows fractional items.',
    'Los objetos YA están en orden decreciente de valor/peso; conserva capacidad y valor decimal.|Toma el menor entre peso del objeto y capacidad restante.|Suma el valor proporcional, reduce la capacidad y termina al llegar a cero.|Evita división entera en C/Java; este ejercicio permite fracciones de objetos.'
  ],
  P70:[
    'parent[x]=x이면 x 자신이 대표입니다.|아니라면 현재 부모를 따라 재귀로 최종 대표를 찾습니다.|재귀에서 돌아온 대표를 parent[x]에도 저장하고 반환합니다. 이것이 경로 압축입니다.|대표를 반환하는 것만으로 부족합니다. 방문한 노드의 parent도 실제로 바뀌어야 합니다.',
    'If parent[x]=x, x is the root.|Otherwise recursively find the root of its current parent.|Write the returned root back into parent[x] and return it: this is path compression.|Returning the root alone is insufficient; visited parent entries must also change.',
    'Si parent[x]=x, x es la raíz.|Si no, busca recursivamente la raíz de su padre actual.|Guarda la raíz devuelta en parent[x] y devuélvela: esto comprime el camino.|No basta devolver la raíz; las entradas parent visitadas también deben cambiar.'
  ],
  P71:[
    '각 정점을 자기 대표로 두고, 가중치 순으로 이미 정렬된 간선을 확인합니다. dsu_find는 제공됩니다.|간선 양 끝의 대표가 다를 때만 선택하고 두 집합을 합칩니다.|선택 비용과 간선 수를 누적합니다. 최종 선택 수가 n-1인지 확인해 연결 불가 반환값을 처리합니다.|대표가 같은 두 정점을 이으면 사이클입니다. n=1에서는 간선 0개로 연결이 완성됩니다.',
    'Initialize each vertex as its own root; edges are already weight-sorted and dsu_find is provided.|Accept an edge only between different roots and unite their sets.|Accumulate cost and selected count; require n-1 edges or return the disconnected sentinel.|Same-root edges create cycles. For n=1, zero edges already connect the graph.',
    'Inicia cada vértice como raíz propia; las aristas ya están ordenadas y dsu_find está disponible.|Acepta solo aristas entre raíces diferentes y une sus conjuntos.|Acumula coste y cantidad; exige n-1 aristas o devuelve el indicador de desconexión.|Entre la misma raíz habría un ciclo; n=1 ya está conectado con cero aristas.'
  ],
  P72:[
    '선택 후보 best=-1로 시작하고 작은 정점 번호부터 순회합니다.|이미 확정된 정점과 거리가 INF인 정점은 건너뜁니다.|첫 유효 정점이거나 기존 후보보다 거리가 작을 때만 best를 바꿉니다.|같은 거리에서는 바꾸지 않아 작은 번호를 유지합니다. 유효 후보가 없으면 -1입니다.',
    'Start best=-1 and scan vertex numbers in increasing order.|Skip finalized vertices and those at INF.|Update for the first valid vertex or a STRICTLY smaller distance.|Do not update on equal distance, preserving the smaller number; no candidate returns -1.',
    'Empieza best=-1 y recorre números de vértice en orden creciente.|Omite los confirmados y los que están en INF.|Actualiza en el primer válido o con una distancia ESTRICTAMENTE menor.|No cambies en empate para conservar el menor número; sin candidato devuelve -1.'
  ],
  P73:[
    '거리 배열은 INF, 확정 표시는 거짓으로 초기화하고 출발점 거리만 0으로 둡니다.|제공된 pick_vertex로 가장 짧은 미확정 정점을 고릅니다. -1이면 더 갈 곳이 없습니다.|선택 정점을 확정하고 존재하는 각 간선으로 갈 때의 새 거리와 기존 거리 중 작은 값을 저장합니다.|-1은 간선 없음이고 가중치 0은 유효한 간선입니다. 도달 불가 거리는 INF를 유지합니다.',
    'Initialize distances to INF and used to false; only the source distance is zero.|Call provided pick_vertex for the closest unfinished vertex; stop if it returns -1.|Finalize it and relax each existing edge using the smaller old/new distance.|Edge value -1 means absent, but weight zero is valid; unreachable distances stay INF.',
    'Inicia distancias en INF y used en falso; solo el origen tiene distancia cero.|Usa pick_vertex para elegir el no confirmado más cercano; termina si devuelve -1.|Confírmalo y actualiza cada arista existente con la menor distancia antigua o nueva.|-1 significa sin arista, pero peso cero es válido; los inalcanzables mantienen INF.'
  ],
  P74:[
    '현재 도시는 0이며 방문 표시를 합니다. 누적 비용은 0입니다.|각 단계에서 미방문 도시를 모두 비교해 가장 가까운 도시를 고릅니다. 동률이면 작은 번호를 유지합니다.|선택 비용을 더하고 그 도시를 방문 처리해 현재 위치를 바꿉니다. 마지막에는 0으로 돌아오는 비용도 더합니다.|완전 탐색 TSP와 다르게 매번 가까운 곳만 고르는 휴리스틱입니다. 귀환 비용을 빠뜨리지 마세요.',
    'Start at city zero, marked visited, with cost zero.|At each step compare ALL unvisited cities, keeping the nearest and lower-numbered on ties.|Add that edge, mark the chosen city, and move; finally add the edge back to zero.|This is a nearest-neighbor heuristic, not exhaustive optimal TSP. Include the return edge.',
    'Empieza en la ciudad cero, marcada visitada, con coste cero.|Compara TODAS las no visitadas en cada paso y conserva la más cercana y el menor número en empate.|Suma la arista, marca y muévete; al final suma la vuelta a cero.|Es una heurística de vecino más cercano, no TSP óptimo exhaustivo; incluye la vuelta.'
  ],
  P75:[
    '작업 시간은 이미 짧은 순서로 정렬되어 있습니다. 경과 시간과 완료 시각 합을 따로 둡니다.|작업 하나를 처리할 때 그 시간을 경과 시간에 더합니다.|방금 늘어난 경과 시간이 그 작업의 완료 시각이므로 전체 합에도 더합니다.|처리 시간 자체의 합과 완료 시각의 합은 다릅니다. 빈 작업 목록은 0입니다.',
    'Durations are already sorted; keep elapsed time and sum of finish times separately.|Add each duration to elapsed.|The new elapsed is this job’s finish time; add it to the total.|Total durations and total finish times differ. Empty jobs give zero.',
    'Las duraciones ya están ordenadas; separa tiempo transcurrido y suma de finalizaciones.|Suma cada duración al tiempo transcurrido.|El nuevo tiempo es la finalización de ese trabajo; añádelo al total.|Suma de duraciones y suma de finalizaciones son distintas; sin trabajos da cero.'
  ],
  P76:[
    'u에 도달할 수 없으면 간선을 따라 새 경로를 만들 수 없으므로 바로 0을 반환합니다.|그 외에는 dist[u]+w를 새 후보 거리로 계산합니다.|새 후보가 dist[v]보다 작을 때만 거리 배열을 바꾸고 1을 반환합니다. 아니면 0입니다.|같은 거리는 갱신이 아닙니다. 반환값뿐 아니라 dist[v]의 변경도 확인합니다.',
    'If u is unreachable, return zero without forming a path.|Otherwise compute dist[u]+w as the candidate distance.|Update dist[v] and return one only when the candidate is smaller; otherwise return zero.|Equal distance is not an update; check the array mutation as well as the return value.',
    'Si u es inalcanzable, devuelve cero sin crear un camino.|Si no, calcula dist[u]+w como distancia candidata.|Cambia dist[v] y devuelve uno solo si es menor; si no, devuelve cero.|Una distancia igual no es actualización; comprueba tanto la modificación como el retorno.'
  ],
  P77:[
    'memo는 실행 환경이 -1로 채워 전달합니다. memo[n]이 -1이 아니면 이미 계산한 결과입니다.|n이 0 또는 1이면 그 값을 memo[n]에도 저장합니다.|그 외에는 앞 두 항을 같은 memo로 재귀 호출해 더하고, 저장한 뒤 반환합니다.|종료 조건에서 반환만 하면 방문 상태 저장을 빠뜨립니다. 받은 memo를 새 표로 바꾸지 마세요.',
    'The environment supplies memo filled with -1; any other memo[n] is already computed.|For n=0 or 1, store the value in memo[n] too.|Otherwise recurse for both preceding terms using the SAME memo, store their sum, and return it.|Base cases must also be stored; do not replace the supplied memo with a fresh table.',
    'El entorno proporciona memo lleno de -1; otro valor en memo[n] ya está calculado.|Para n=0 o 1 guarda también el valor en memo[n].|Para los demás, calcula ambos anteriores con el MISMO memo, guarda su suma y devuélvela.|También se guardan los casos base; no reemplaces el memo recibido por otra tabla.'
  ],
  P78:[
    '폭 0과 1의 방법 수는 각각 1입니다. m으로 나눈 값을 시작 상태로 둡니다.|폭 i의 마지막은 세로 한 개 또는 가로 두 개이므로 앞 두 폭의 방법 수를 더합니다.|매번 m으로 나눈 뒤 이전 두 값을 이동시켜 폭 n까지 계산합니다.|n=0의 빈 보드도 한 방법입니다. m=1이면 반환할 나머지는 0입니다.',
    'Widths zero and one each have one tiling; initialize their residues modulo m.|Width i ends with one vertical or two horizontal dominoes, so add the previous two counts.|Reduce modulo m, shift the two states, and repeat through n.|An empty board counts as one tiling. m=1 returns zero.',
    'Las anchuras cero y uno tienen una forma; inicia sus restos módulo m.|La anchura i termina en uno vertical o dos horizontales: suma los dos conteos anteriores.|Aplica módulo m, avanza los estados y continúa hasta n.|El tablero vacío cuenta como una forma; m=1 devuelve cero.'
  ],
  P79:[
    'dp[x]는 x에서 1까지 필요한 최소 연산 수입니다. dp[1]=0에서 작은 수부터 채웁니다.|먼저 x-1로 가는 후보를 넣고, 2·3·5로 나누어떨어질 때만 해당 나눗셈 후보도 비교합니다.|각 후보는 다음 상태의 dp에 이번 연산 1을 더한 값입니다. 가장 작은 값을 저장합니다.|가장 큰 수로 나누는 탐욕법이 아닙니다. 나머지가 있는 나눗셈을 후보에 넣지 마세요.',
    'dp[x] is minimum operations from x to 1; fill from small values with dp[1]=0.|Start with x-1, then consider division by 2,3,5 ONLY when divisible.|Each candidate costs its next-state dp plus one; store the minimum.|Do not greedily pick the largest divisor or use non-exact divisions.',
    'dp[x] es el mínimo de operaciones de x a 1; rellena desde los pequeños con dp[1]=0.|Empieza por x-1 y considera dividir por 2,3,5 SOLO si es exacto.|Cada candidato cuesta su dp siguiente más uno; guarda el mínimo.|No elijas vorazmente el mayor divisor ni uses divisiones con resto.'
  ],
  P80:[
    '올바른 dp는 제공됩니다. 경로를 n으로 시작하고 현재 값이 1보다 큰 동안 이동합니다.|다음 후보를 -1,÷2,÷3,÷5 순서로 만듭니다. 나눗셈은 나누어떨어질 때만 후보입니다.|dp가 현재보다 정확히 1 작은 첫 후보를 선택하고 경로에 넣습니다.|경로에는 출발 n과 마지막 1도 들어갑니다. 동률 순서는 문제에 지정된 순서를 지킵니다.',
    'Correct dp is supplied. Start the path with n and move while the current value exceeds one.|Try next states in order: subtract one, divide by 2,3,5 when divisible.|Choose the FIRST candidate whose dp is exactly one smaller, and append it.|Include both n and the final 1; preserve the specified tie order.',
    'Se proporciona dp correcto. Empieza la ruta con n y avanza mientras sea mayor que uno.|Prueba en orden: restar uno, dividir por 2,3,5 si es exacto.|Elige el PRIMER candidato con dp exactamente uno menor y añádelo.|Incluye n y el 1 final; respeta el orden de empate indicado.'
  ],
  P81:[
    'dp[i][c]는 앞 i개 물건으로 용량 c까지 담는 최대 가치입니다. 0개 행은 0입니다.|현재 물건을 안 고르는 후보는 이전 행의 같은 용량 값입니다.|물건이 들어가면 이전 행의 c-무게 값에 현재 가치를 더한 후보와 비교해 큰 쪽을 저장합니다.|선택 후보도 반드시 이전 행을 읽습니다. 같은 행을 읽으면 현재 물건을 여러 번 쓸 수 있습니다.',
    'dp[i][c] is best value using the first i items within capacity c; row zero is zero.|Skipping the item uses the previous row at the same capacity.|If it fits, compare against previous row at c-weight plus the item value.|BOTH choices read the previous row, preventing reuse of the current item.',
    'dp[i][c] es el mejor valor de los primeros i objetos con capacidad c; la fila cero vale cero.|Omitir el objeto usa la fila anterior en la misma capacidad.|Si cabe, compara con fila anterior en c-peso más su valor.|AMBAS opciones leen la fila anterior para no reutilizar el objeto actual.'
  ],
  P82:[
    'dp[c]를 모두 0으로 시작하고 물건을 하나씩 처리합니다.|물건 하나에 대해 용량은 W부터 그 물건 무게까지 내림차순으로 바꿉니다.|현재 dp[c]와 dp[c-무게]+가치 중 큰 값을 저장하고 마지막 dp[W]를 반환합니다.|용량을 오름차순으로 돌면 방금 갱신한 값을 읽어 같은 물건을 중복 선택할 수 있습니다.',
    'Initialize dp[c] to zero and process one item at a time.|For each item scan capacities DOWNWARD from W to its weight.|Store the larger of dp[c] and dp[c-weight]+value; return dp[W].|An upward scan can reuse the same item through newly updated entries.',
    'Inicia dp[c] en cero y procesa un objeto cada vez.|Para cada objeto recorre capacidades de MAYOR a MENOR desde W hasta su peso.|Guarda el mayor entre dp[c] y dp[c-peso]+valor y devuelve dp[W].|Recorrer hacia arriba puede reutilizar el objeto con entradas recién actualizadas.'
  ],
  P83:[
    'dp[i][j]는 앞 i글자와 앞 j글자의 LCS 길이입니다. 빈 접두사의 행·열은 0입니다.|실제 비교할 문자는 a[i-1],b[j-1]입니다. 같으면 왼쪽 위 값에 1을 더합니다.|다르면 위와 왼쪽 값 중 큰 값을 저장합니다. 마지막 칸이 전체 두 문자열의 답입니다.|부분 수열은 연속할 필요가 없습니다. 문자 인덱스와 dp 인덱스의 1 차이를 확인하세요.',
    'dp[i][j] is LCS length of prefixes of i and j characters; empty-prefix row and column are zero.|Compare a[i-1] and b[j-1]; equal characters add one to the diagonal value.|For a mismatch take the larger of the upper and left values; the final cell is the answer.|A subsequence need not be contiguous. Check the one-index offset between characters and dp.',
    'dp[i][j] es la longitud LCS de prefijos de i y j caracteres; fila y columna vacías son cero.|Compara a[i-1] y b[j-1]; si coinciden suma uno a la diagonal.|Si difieren toma el mayor de arriba e izquierda; la última celda es la respuesta.|Una subsecuencia no necesita ser contigua; verifica el desfase de uno entre letras y dp.'
  ],
  P84:[
    '제공된 dp의 오른쪽 아래에서 시작하고 역순으로 문자를 모읍니다.|문자가 같으면 그 문자를 저장하고 대각선 왼쪽 위로 이동합니다.|다르면 dp가 큰 쪽으로 이동합니다. 위와 왼쪽이 같으면 위를 선택하고 마지막에 모은 문자를 뒤집습니다.|두 문자열 중 하나의 길이 0 위치에 닿으면 종료합니다. 길이 대신 실제 수열을 반환하는 문제입니다.',
    'Start at the bottom-right of supplied dp, collecting characters backward.|Matching characters are recorded, then move diagonally up-left.|On mismatch follow the larger dp, preferring UP on ties; reverse collected characters at the end.|Stop at a zero-length prefix. Return an actual sequence, not only its length.',
    'Empieza abajo a la derecha del dp recibido y recoge caracteres al revés.|Si coinciden, guarda el carácter y avanza en diagonal arriba-izquierda.|Si difieren sigue el dp mayor, eligiendo ARRIBA en empate; invierte lo recogido al final.|Termina en un prefijo de longitud cero; devuelve una secuencia, no solo su longitud.'
  ],
  P85:[
    '이전 원소까지의 최고합과 그 전까지의 최고합 두 값을 0으로 준비합니다.|현재 값을 안 고르면 직전 최고합, 고르면 전전 최고합+현재 값입니다.|둘 중 큰 값을 새 최고합으로 정한 뒤 두 상태를 한 칸 이동시킵니다.|새 값을 계산하기 전에 이전 상태를 덮어쓰지 않습니다. 빈 선택을 허용해서 음수뿐이면 0입니다.',
    'Track best sums for the previous and the preceding prefixes, initially zero.|Skipping uses the previous best; taking uses the preceding best plus the current value.|Choose the larger as current best, THEN shift the two states.|Do not overwrite old states before computing the new one. Empty selection allows zero for all-negative input.',
    'Mantén los mejores de los dos prefijos anteriores, inicialmente cero.|Omitir usa el anterior; elegir usa el anterior a ese más el valor actual.|Escoge el mayor y DESPUÉS avanza ambos estados.|No sobrescribas estados antes de calcular; la selección vacía permite cero si todos son negativos.'
  ],
  P86:[
    'dp[i][j]는 그 칸까지 온 최소 비용입니다. 시작 칸은 비용 전액으로 초기화합니다.|위 또는 왼쪽에서 올 때는 현재 칸 전액을 더한 후보를 만듭니다.|왼쪽 위에서 대각선으로 올 때만 현재 칸 비용의 정수 절반을 더하고 세 후보 중 최솟값을 저장합니다.|첫 행·첫 열에는 없는 이웃을 읽지 않습니다. 할인은 출발 칸이 아니라 도착 칸에 적용합니다.',
    'dp[i][j] is minimum cost to reach that cell; the start pays its FULL cost.|Arriving from above or left adds the current cell’s full cost.|Only a diagonal arrival adds its integer HALF cost; keep the minimum valid candidate.|Do not read missing neighbors on the first row/column. Discount the destination, not departure cell.',
    'dp[i][j] es el coste mínimo para llegar a la celda; el inicio paga TODO su coste.|Llegar desde arriba o izquierda suma el coste completo de la celda actual.|Solo la llegada diagonal suma su MITAD entera; conserva el mínimo candidato válido.|No leas vecinos ausentes en primera fila/columna; descuenta la celda de llegada, no la de salida.'
  ]
};
HINT_GUIDES.P47 = HINT_GUIDES.P01;
HINT_GUIDES.P48 = HINT_GUIDES.P02;
function problemHintGuide(p) {
  const id = typeof canonicalProblemId === 'function' ? canonicalProblemId(p.id) : p.id;
  const entry = HINT_GUIDES[id];
  if (!entry) return null;
  const locale = typeof UI_LOCALE === 'string' ? UI_LOCALE : 'ko';
  const parts = entry[locale === 'en' ? 1 : locale.startsWith('es') ? 2 : 0].split('|');
  return {steps:parts.slice(0, 3), check:parts[3]};
}

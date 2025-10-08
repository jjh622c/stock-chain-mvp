import csv

# 원본 CSV 읽기
input_file = '상품_일괄수정_엑셀양식.csv'
output_file = 'products_import.csv'

products = []

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)

    # 헤더 찾기 (30번째 줄)
    for i in range(30):
        next(reader)

    # 데이터 읽기
    for row in reader:
        if len(row) >= 13:
            product_name = row[4].strip()  # 상품명
            category = row[3].strip()       # 카테고리(2차)
            unit_price = row[12].strip()    # 유통사 매입단가
            description = row[5].strip()    # 판매규격

            # 빈 값 체크
            if product_name and unit_price and unit_price.replace(',', '').isdigit():
                # 쉼표 제거하고 숫자만
                price = unit_price.replace(',', '')

                # CSV 안전하게 처리 (쉼표와 따옴표 이스케이프)
                if ',' in product_name or '"' in product_name:
                    product_name = f'"{product_name.replace(chr(34), chr(34)+chr(34))}"'
                if ',' in description or '"' in description:
                    description = f'"{description.replace(chr(34), chr(34)+chr(34))}"'
                if ',' in category or '"' in category:
                    category = f'"{category.replace(chr(34), chr(34)+chr(34))}"'

                products.append([product_name, category, price, description])

# CSV 쓰기
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['name', 'category', 'unit_price', 'description'])
    writer.writerows(products)

print(f'총 {len(products)}개 상품을 {output_file}에 저장했습니다.')
print(f'\n처음 10개 상품:')
for i, p in enumerate(products[:10], 1):
    print(f'{i}. {p[0]} - {p[1]} - {p[2]}원')

حتماً. پیش‌شماره‌های داخل تصویر را استخراج کردم و در پرامپت زیر به‌صورت **۶ رقمی و مناسب تشخیص BIN کارت** قرار دادم. همچنین همه اصلاحات و قابلیت‌هایی که در پیام‌های قبلی گفتی را یکجا و ساختاریافته آوردم تا فیگما یک دستور جامع داشته باشد.

# Complete Figma Implementation Prompt — An Pardaz Banking, Payment, Exchange, and Financial App

Use this prompt as the complete implementation specification for the application. Do not remove existing functionality unless explicitly requested below. Preserve the current visual identity of the application, but fix all layout, usability, responsiveness, input, card-selection, payment, banking-logo, authentication, transaction, exchange, and interaction problems described below.

All Persian text written between `::` markers must remain exactly Persian and must be used as the corresponding UI label, button text, field label, message, or content.

---

## 1. Global UI, Layout, Spacing, and Responsiveness

The application must be fully responsive and optimized for both web and mobile/APK.

Fix all pages so that:

* Primary action buttons are not pushed too far toward the bottom of the screen.
* Reduce unnecessary vertical spacing between forms as much as reasonably possible.
* Avoid unnecessary scrolling on payment and transaction pages.
* Primary action buttons must remain clearly visible without requiring unnecessary scroll.
* Never allow buttons or form controls to extend outside the viewport.
* Never allow any input field, cursor, typed text, or button to render outside its intended container.
* Remove the faint horizontal white line that currently appears between the `::ماه::`, `::سال::` fields and the bottom action button on all payment pages.
* Keep form heights consistent with each other.
* In `::موجودی کارت::`, all relevant form heights must be equal.
* In every payment page, all payment-form heights must be equal.
* Maintain consistent spacing between `::ماه::`, `::سال::`, and the primary action button throughout the application.
* The vertical distance between the `::استعلام::` button in `::موجودی کارت::` and the `::ماه::` / `::سال::` fields must be visually consistent with the distance between the `::انتقال::` button and the `::ماه::` / `::سال::` fields in the final `::انتقال وجه::` payment page.
* Buttons must never visually stick directly to the expiration-date fields.

---

# 2. Main Home Screen

The large green card/banner on the home screen is currently too bright.

Change it so that:

* Its color is more refined and professional.
* It should use the same visual color family as the application logo.
* Avoid excessive brightness.
* Preserve the application's green identity but make the card more elegant and premium.

At the top-left user icon/avatar:

* Do not display only the first letter of the user name.
* Display the user's actual name inside the user/profile area.

At the bottom of the main green card, change the service labels to exactly:

::خدمات مالی::
::ارز دیجیتال::
::فارکس::
::درآمد ارزی::

---

# 3. Main Payment Buttons

The following buttons are currently too low on the screen:

::استعلام::
::مرحله بعد::
::انتقال::
::پرداخت::

This affects:

::موجودی کارت::
::انتقال وجه::
::شارژ مستقیم::
::بسته اینترنت::

Move these buttons upward and reduce excessive vertical spacing so the pages look balanced and ideally do not require unnecessary scrolling.

---

# 4. Expiration Date Fields

The two fields for expiration date must always work correctly.

Use:

::ماه::
::سال::

Do NOT use `MM` or `YY` as the normal placeholder.

In the default state:

* Replace `MM` with `::ماه::`.
* Replace `YY` with `::سال::`.

The two fields must:

* Accept exactly two digits.
* Allow the user to type.
* Allow pasted values.
* Allow deletion.
* Never place the cursor outside the field.
* Never render typed digits outside the field.
* Never overlap other controls.
* Never become visually broken.
* Have sufficient width for exactly two digits.
* Have equal height to the other payment fields.
* Have a combined width equal to the reference card-number field on the same page.

For example:

If the first/reference card field has width X:

* `::ماه::` + `::سال::` combined width = X.
* `::cvv2::` width = X.
* `::رمز پویا::` field + `::رمز پویا::` button combined width = X.

Apply this consistently to:

::موجودی کارت::
::انتقال وجه::
::شارژ مستقیم::
::بسته اینترنت::
::نیکوکاری::
and all other payment pages.

Digits entered into `::ماه::` and `::سال::` must automatically be masked exactly like `::cvv2::`.

Even when the application automatically fills the month/year from a selected card, the digits must remain hidden.

---

# 5. Dynamic OTP / ::رمز پویا::

Whenever the user clicks:

::رمز پویا::

show a beautiful countdown/loading animation inside or around the button.

Use an elegant hourglass, clock-hand, circular countdown, or similar animation.

During the 40-second waiting period:

* The button becomes visually disabled and slightly faded.
* The animation clearly communicates that the user must wait.
* The user cannot request another OTP before 40 seconds.
* The button returns to its active state after the countdown.

The OTP input must:

* Accept exactly 5 digits.
* Never accept a sixth digit.
* Allow typing.
* Allow pasting.
* Mask the entered OTP for security.
* Center the OTP digits inside the field.
* Move the digits sufficiently toward the right so they never overlap the paste button.
* The first and second OTP digits must never be hidden underneath or overlap the paste button.
* The cursor and typed text must remain inside the field.

Remove all `----` placeholder characters from OTP fields.

After the user completes `::رمز پویا::`:

* Automatically move focus to `::cvv2::`.

After completing the 3-digit `::cvv2::`:

* Automatically move focus to `::ماه::`.

After completing `::ماه::`:

* Automatically move focus to `::سال::`.

`::cvv2::` must accept exactly 3 digits and no more.

Remove all `----` placeholder characters from `::cvv2::`.

Center both OTP and CVV2 digits inside their fields.

---

# 6. Card Number Fields

All card-number input fields must support:

* 16-digit card numbers.
* Automatic bank detection while typing.
* Automatic bank-name recognition.
* Automatic bank-logo recognition.
* Displaying the detected bank logo on the right side of the field.
* Proper RTL/LTR handling.
* Correct cursor positioning.
* No overflow.
* No characters outside the field.

When the user types the first digits of a card number, detect the corresponding bank using the BIN database provided below.

If the bank is recognized:

* Display the correct bank name where appropriate.
* Display the real uploaded logo of that bank.
* Use the bank's own visual theme/color where appropriate.

Never show every bank card using the application's green theme.

---

# 7. Bank Card Logos

All uploaded Iranian bank logos must be used throughout the application.

Any location displaying a bank card must show:

* Correct bank logo.
* Correct bank-specific color/theme.
* 16-digit card number.
* Cardholder name where available.
* Appropriate card design.

If a logo image contains written words or long sentences, remove the unnecessary text portion and retain only the recognizable logo symbol/mark, because the application has limited UI space.

The uploaded bank logos must be used rather than manually recreated alternatives.

There are more than 40 bank-logo files.

I will provide additional remaining bank logos in subsequent messages. When additional logos are uploaded, integrate them into the same bank-logo system without replacing or breaking the previously integrated logos.

---

# 8. Supported Iranian Banks

The application must support recognition and visual identity for at least these institutions:

::بانک ملی ایران::
::بانک سپه::
::بانک صنعت و معدن::
::بانک کشاورزی::
::بانک مسکن::
::بانک توسعه صادرات ایران::
::بانک توسعه تعاون::
::پست بانک ایران::
::بانک اقتصاد نوین::
::بانک ایران زمین::
::بانک پارسیان::
::بانک پاسارگاد::
::بانک تجارت::
::بانک خاورمیانه::
::بانک دی::
::بانک رفاه کارگران::
::بانک سامان::
::بانک سرمایه::
::بانک سینا::
::بانک شهر::
::بانک صادرات ایران::
::بانک کارآفرین::
::بانک گردشگری::
::بانک ملت::
::بانک حکمت ایرانیان::
::بانک قرض‌الحسنه مهر ایران::
::بانک قرض‌الحسنه رسالت::
::مؤسسه مالی و اعتباری انصار::
::مؤسسه مالی و اعتباری قوامین::
::مؤسسه اعتباری ملل::

Also support legacy/alias institutions shown in the uploaded BIN reference:

::مهر اقتصاد::
::مؤسسه اعتباری توسعه::
::مؤسسه اعتباری کوثر::

---

# 9. Bank BIN / Card Prefix Detection Database

Use the following six-digit BIN/prefix mappings extracted from the uploaded reference image.

Treat these as card-number detection rules. Normalize Persian/Arabic digits to Western digits internally and compare the first six digits of the card number.

Important:

* Some banks have multiple prefixes.
* A bank may have multiple legacy prefixes.
* Never assume that one bank has only one prefix.
* If multiple supported prefixes exist for one bank, recognize all of them.
* Use exact six-digit matching.
* Do not replace these mappings with approximate guesses.
* The backend should be able to extend this mapping later.

### BIN mappings extracted from the uploaded image

| Bank / Institution       | Six-digit BIN |
| ------------------------ | ------------- |
| ::اقتصاد نوین::          | `627412`      |
| ::شهر::                  | `504706`      |
| ::انصار::                | `627381`      |
| ::صادرات ایران::         | `603769`      |
| ::ایران زمین::           | `505785`      |
| ::صنعت و معدن::          | `627961`      |
| ::پارسیان::              | `622106`      |
| ::قرض الحسنه مهر ایران:: | `606373`      |
| ::پارسیان::              | `639194`      |
| ::قوامین::               | `639599`      |
| ::پارسیان::              | `627884`      |
| ::کارآفرین::             | `627488`      |
| ::پاسارگاد::             | `639347`      |
| ::کارآفرین::             | `502910`      |
| ::پاسارگاد::             | `502229`      |
| ::کشاورزی::              | `603770`      |
| ::آینده::                | `636214`      |
| ::گردشگری::              | `505416`      |
| ::تجارت::                | `627753`      |
| ::توسعه تعاون::          | `502908`      |
| ::مرکزی::                | `636795`      |
| ::مسکن::                 | `628023`      |
| ::توسعه صادرات ایران::   | `627648`      |
| ::ملت::                  | `610433`      |
| ::توسعه صادرات ایران::   | `207177`      |
| ::ملت::                  | `991975`      |
| ::حکمت ایرانیان::        | `636949`      |
| ::دی::                   | `502938`      |
| ::ملی ایران::            | `603799`      |
| ::رفاه کارگران::         | `589463`      |
| ::ملل::                  | `606256`      |
| ::سامان::                | `621986`      |
| ::مهر اقتصاد::           | `639370`      |
| ::سپه::                  | `589210`      |
| ::پست بانک ایران::       | `627760`      |
| ::سرمایه::               | `639607`      |
| ::مؤسسه اعتباری توسعه::  | `628157`      |
| ::سینا::                 | `639346`      |
| ::مؤسسه اعتباری کوثر::   | `505801`      |

These BINs must be used to fix the current bank-name recognition problem.

When the user begins entering a card number, detect the bank as early as the available digits allow, but only display a bank identity when the prefix is sufficiently matched.

---

# 10. Bank Card Selection — Global Consistency

Everywhere the application shows a list of bank cards, use one unified card component.

This applies to:

* `::پروفایل::` → `::کارتهای بانکی::`
* `::موجودی کارت::`
* `::انتقال وجه::`
* all payment pages
* all withdrawal pages
* exchange pages
* any card-selection popup

Every card must show:

* Correct bank logo.
* Bank-specific card color/theme.
* 16-digit card number.
* Cardholder name when available.
* Proper realistic card styling.

Do NOT display all cards using the application's green theme.

---

# 11. Profile → Bank Cards

In:

::پروفایل::

→

::کارتهای بانکی::

show the user's registered cards in a beautiful popup/list.

Each card must contain:

* Bank logo.
* Bank-specific color.
* 16-digit card number.
* Cardholder name.
* Proper card visual identity.

The card-selection popup must be identical in visual structure to the correct card-selection popup already used in:

::موجودی کارت::

This is required for application-wide consistency.

---

# 12. Add New Card

In `::موجودی کارت::`, when the user clicks the card-number field, open the card-selection popup.

Remove:

* The manual card-number input currently inside that popup.
* The sentence `یا شماره کارت را وارد کنید:`.
* Any unnecessary `xxxx` placeholder.

At the bottom add a beautiful button:

::اضافه کردن کارت جدید::

When clicked, open a centered modal with:

Text:

::با توجه به دستورالعمل بانک مرکزی، بانک شما به سامانه هاب شاپرک اضافه گردیده است. لازم است که ابتدا اطلاعات کارت بانکی خود را در این سامانه ثبت کنید. بعد از ثبت می توانید به برنامه آن پرداز بازگردید و تراکنش را ادامه دهید.::

Buttons:

::ثبت کارت::
::انصراف::

If the user clicks:

::انصراف::

close the modal.

If the user clicks:

::ثبت کارت::

open the previously supplied Shaparak card-enrollment URL:

[https://tsm.shaparak.ir/cardManagement/enrollment.html?tid=a94a717e-a56e-42c7-b53f-81d2e997d2c1](https://tsm.shaparak.ir/cardManagement/enrollment.html?tid=a94a717e-a56e-42c7-b53f-81d2e997d2c1)

The same add-card modal must be reused in:

::پروفایل::
→
::کارتهای بانکی::

The two modals must look exactly the same.

---

# 13. Shaparak Registered Cards

After a card is registered through the Shaparak card-management flow, the registered card must be available inside:

::پروفایل::
→
::کارتهای بانکی::

The card must also become available in every card-selection popup throughout the application.

---

# 14. Default Demo Mellat Card

Add one beautiful synthetic/demo card by default for testing.

Use:

Bank:

::بانک ملت::

The card must:

* Look highly realistic but clearly be a synthetic/demo UI card.
* Use Mellat's uploaded logo.
* Use Mellat's visual/theme color.
* Show a 16-digit demo card number.
* Show CVV2.
* Show month and year.
* Be selectable in testing.

Use this synthetic test card number:

`6104331234567890`

Use clearly synthetic/demo expiration and CVV2 values such as:

CVV2: `123`
Month: `12`
Year: `30`

The card must be selectable from:

::شماره کارت::
::کارت مبدا::
and all relevant payment-card selection fields.

Do not connect this demo card to a real banking account or real financial transaction.

---

# 15. Automatic Expiration Fill From Selected Card

When the user selects a registered card from any card-selection popup:

* Automatically populate `::ماه::` with the card's expiration month.
* Automatically populate `::سال::` with the card's expiration year.
* Keep these values masked.
* Allow the user to edit them.
* Allow the user to delete them.
* Never prevent manual correction.

Apply this to:

::موجودی کارت::

and every payment page.

---

# 16. Direct Charge and Internet Package

In:

::شارژ مستقیم::
and
::بسته اینترنت::

the operator logos uploaded by me must be used:

::ایرانسل::
::همراه اول::
::رایتل::

When a phone number is entered:

* Detect the operator.
* Display the correct uploaded operator logo.
* Place the logo beside the phone number field or in the most visually appropriate location.
* Do not use incorrect replacement logos.

---

# 17. Contacts Integration

In:

::شارژ مستقیم::
::بسته اینترنت::

the:

::مخاطبین::

button must work in the installed APK/mobile version and web version where browser permissions allow it.

If a contact phone number is stored as:

`+98...`
`0098...`
`98...`

automatically normalize it to the application's expected Iranian mobile format:

`09xxxxxxxxx`

Example:

`+989161415778`

must become:

`09161415778`

The application must accept valid Iranian mobile numbers containing exactly 11 digits.

Do not show:

::شماره خودم::

when the user opens the contacts selector in:

::قبض::

Instead, allow the user to select an actual contact.

In:

::قبض::

the `::مخاطبین::` button must correctly open the phone contacts picker where the platform supports it.

---

# 18. Payment Page Structure

Use the correct card form as the reference width.

For every payment page:

* Card field = reference width.
* CVV2 field = same width as card field.
* `::ماه::` + `::سال::` combined width = card field width.
* `::رمز پویا::` field + `::رمز پویا::` button combined width = card field width.
* All fields have equal height.
* All fields are aligned cleanly.
* Buttons do not stick to expiration fields.
* No unwanted horizontal divider appears.

---

# 19. ::موجودی کارت::

Fix:

* `::استعلام::` position.
* Vertical spacing.
* Card popup.
* Card logo.
* Card detection.
* OTP input.
* CVV2 input.
* Month/year input.
* Button spacing.
* No unnecessary scrolling.

When the user clicks `::استعلام::`, the page must not visually break or reflow incorrectly.

---

# 20. ::انتقال وجه::

The first card popup must match the card popup used in:

::موجودی کارت::

When the user clicks:

::مرحله بعد::

move to the final transfer-payment page.

Correct the arrow between:

::از مبدا::
and
::به مقصد::

The arrow is currently rotated incorrectly; correct its direction/orientation by 180 degrees.

On the final transfer payment page:

* `::مبلغ انتقال::` is the reference width.
* `::رمز پویا::` field + button combined width = `::مبلغ انتقال::` width.
* `::ماه::` + `::سال::` combined width = `::مبلغ انتقال::` width.
* Move `::انتقال::` upward.
* Maintain the same button-to-expiration-field spacing as `::استعلام::` on `::موجودی کارت::`.

After clicking `::انتقال::`, the page must not break or visually collapse.

---

# 21. Payment Page Variants

Create payment pages with the same reliable structure and visual language as the final:

::بسته اینترنت::

payment page for:

::قبض قضائیه::
::قبض ثبت اسناد::
and other applicable bills.

---

# 22. Bill Payment Flow

When the user clicks:

::قبض::

and completes the form and clicks:

::استعلام و پرداخت::

navigate to a new payment page.

This page must visually match the final:

::بسته اینترنت::

payment page.

Difference:

At the top show:

* Selected bill logo.
* Bill amount.
* First and last name of the bill account holder.

Then show:

* Card selection.
* OTP.
* CVV2.
* Expiration date.
* Final payment button.

---

# 23. Traffic Violation Payment

When the user clicks:

::خلافی خودرو::

and completes the vehicle plate form and clicks:

::استعلام خلافی::

navigate to a payment page matching:

::بسته اینترنت::

payment page.

At the top show:

* Vehicle violation date range.
* Vehicle plate number.
* First and last name of the vehicle owner.
* Amount to be paid.

Then show the standard payment forms.

---

# 24. Charity Payment

When the user selects:

::نیکوکاری::

selects a charity institution and enters an amount, navigate to a payment page.

This page must visually match the final:

::بسته اینترنت::

payment page.

At the top show:

* Selected charity institution name.
* Entered donation amount.

Then show:

* Bank card.
* OTP.
* CVV2.
* Expiration date.
* `::پرداخت::`

Use exactly the same payment form components as the Internet Package payment page.

---

# 25. Internet Package Information Box

On the final:

::بسته اینترنت::

page, the top information box must be large enough for long package descriptions.

Prevent:

* Text collision.
* Text overlap.
* Clipped descriptions.
* Broken line wrapping.

The box must grow vertically when necessary while preserving the layout.

---

# 26. Insurance Pages

For:

::بیمه ثالث::
::بیمه بدنه::
::بیمه موتور::

the pages must never become black or blank.

If the user completes the insurance information and clicks:

::تایید اطلاعات::

show a beautiful centered modal.

Text:

::سرویس های مربوط به بیمه نامه ها به زودی توسط تیم فنی آن پرداز در دسترس قرار می گیرند.::

Do not show a black screen.

---

# 27. Vehicle Plate Pages

For:

::عوارض آزاد راه::
::طرح ترافیک::

allow the user to:

* View the vehicle plate.
* Edit plate information.
* Enter/change plate characters.
* Save/register the updated plate.
* Correctly validate the plate format.

---

# 28. ::ثبت ثنا::

After the user completes the forms and clicks:

::ثبت نام::

show a beautiful animation.

Do not show the old plain confirmation message.

After the animation, display:

::جهت تکمیل ثبت نام ثنای خود، در کمتر از یکساعت ، همکاران دفاتر خدمات قضایی با شما تماس خواهند گرفت.::

---

# 29. Transactions

In:

::تراکنش ها::

show all successful transactions.

All successful:

::موجودی کارت::
::انتقال وجه::

transactions must display:

::موفق::

including transfer transactions.

For balance and transfer transactions:

* Display the source bank logo.
* Display the transaction details.

For:

::ایرانسل::
::همراه اول::
::رایتل::

show the corresponding operator logo.

For bills:

* Show the relevant bill logo.
* Associate the logo with the correct transaction.

The transaction list must use the actual logo of the relevant bank/operator/bill.

---

# 30. Transaction Receipt Navigation

When the user is viewing a transaction receipt popup and closes the receipt:

The application must always navigate the user back to the main home screen.

Do not leave the user stranded on the payment page.

---

# 31. Amount Conversion

All amount-entry fields use Rial as the numeric input unit.

The equivalent text below the field must be calculated in Toman.

Example:

If the user enters:

`20000`

the system must interpret it as:

20,000 Rial

and display the equivalent Toman text:

::دو هزار تومان::

Do this consistently in all amount-entry fields.

---

# 32. Authentication — 6 Digit Login Code

When the user enters the 6-digit login/verification code:

* As soon as the sixth digit is correctly entered, automatically continue.
* The user must not need to click:
  ::تایید و ادامه::

The 6-digit input must allow deletion.

When the user presses the keyboard backspace/delete button:

* Delete the last entered digit.
* When holding backspace/delete, continue deleting previous digits automatically.
* Never lock the user inside the input.
* Correct cursor behavior must be maintained.

---

# 33. Four-Digit User PIN

During first registration, the user creates a 4-digit PIN.

After the user logs out and later enters the mobile number and successfully completes the 6-digit authentication:

The application must require the user to enter the previously created 4-digit PIN before granting access to the main application.

Do not skip the 4-digit PIN screen for returning users.

---

# 34. Mobile Authentication Video

In the identity-verification flow:

The mobile APK must allow the user to record a video using the phone camera.

The existing video-record button currently fails in the APK even though uploading works.

Fix this.

Provide both:

::ضبط ویدئو::
and
::آپلود ویدئو::

The user must be able to either:

* Record a video directly.
* Upload an existing video.

Handle mobile permissions correctly.

---

# 35. Forex Robot

On the main exchange page:

Create a small fixed button:

::ربات فارکس::

Place it at the top-right of the green exchange card/banner.

The button must:

* Have the same dimensions as:
  ::ارسال تیکت::
* Be simple.
* Look premium and professional.
* Have a subtle attractive glow.
* Avoid the current overly bright/unprofessional styling.

---

# 36. Forex Robot Warning Modal

When the user clicks:

::ربات فارکس::

show a beautiful warning modal before entering the robot page.

Include appropriate warnings such as:

* Never put all available capital into the Forex market.
* Forex trading carries substantial risk.
* Past performance does not guarantee future results.
* The trading robot does not guarantee profit.
* The user is responsible for the capital allocated to the robot.
* Only allocate an amount the user can afford to risk.

Provide:

::تایید::

After the user accepts, navigate to the Forex robot page.

---

# 37. Forex Robot Page

At the top show the user's total USDT balance from:

::دارایی ها::

Example default test balance:

`50 USDT`

For testing purposes, give the robot page a default demo/test balance of 50 USDT.

Under the total balance show:

::موجودی فعال در ربات ۰ دلار تتر::

Then create the input:

::مقدار دلار تتر جهت معامله در بازار فارکس را وارد کنید::

If the user enters an amount at least 3 USDT lower than their available total balance, allow it.

Update:

::موجودی فعال در ربات ۰ دلار تتر::

based on the entered amount.

Do not allow the active robot allocation to exceed the user's available balance minus the required 3 USDT reserve.

---

# 38. Activate Forex Robot

Create a red button:

::ربات آن پرداز را فعال می کنم::

When clicked:

Show a beautiful animated modal containing:

* Green and red candlestick animation.
* Trading-style movement.
* Professional financial UI animation.

Text under animation:

::بعد از تایید توسط آن پرداز، ربات شما با مقدار x دلار تتر شروع به معامله در بازار فارکس می کند::

Where x is dynamically replaced by the amount entered by the user.

Under it show in yellow:

::در حال تایید اولیه::

The modal remains active while waiting for backend/admin approval.

When the admin approves the user through the admin panel/database, change the status to:

::ربات متصل و فعال و در حال ترید است::

Use an attractive green color for the active status.

Also show:

::سود و زیان ربات هر ۲۴ ساعت یکبار و یا هر ۴۸ ساعت یکبار آپدیت می شود::

---

# 39. Disable Forex Robot

At the bottom of the robot modal/page create:

::ربات آن پرداز را غیر فعال می کنم::

When clicked, ask:

::آیا از متوقف کردن ربات فارکس آن پرداز اطمینان دارید؟ (در هر ۲۴ ساعت فقط یکبار اجازه فعال و غیر فعال کردن ربات را دارید)::

Buttons:

::متوقف کردن::
::انصراف::

If the user selects:

::متوقف کردن::

close the candlestick animation modal.

Show:

::تا ۲۴ ساعت دیگر شما نمی توانید از ربات معامله گر فارکس آن پرداز استفاده کنید::

Disable/fade:

::ربات آن پرداز را فعال می کنم::

for 24 hours.

Do not allow repeated activation/deactivation during the 24-hour cooldown.

---

# 40. Forex Robot Trading History

Create beautiful information cards for:

* Trading history.
* Number of robot activations.
* Number of robot deactivations.
* Capital allocated per trading session.
* Profit per trade.
* Loss per trade.
* Total profit.
* Total loss.
* Robot activation date.
* Robot deactivation date.
* Current robot status.

Also display a beautiful robot profitability chart.

---

# 41. Forex Robot Balance Logic

Example:

User has:

`100 USDT`

in:

::دارایی ها::

User allocates:

`50 USDT`

to the robot.

While the robot is active:

* The 50 USDT allocated to the robot cannot be spent elsewhere.
* Available balance must reflect the locked trading allocation.

If the robot generates:

`20 USDT`

profit:

The returned balance becomes:

`70 USDT`

and the total user balance becomes:

`120 USDT`

The robot page must always show the updated total USDT balance.

The:

::دارایی ها::

balance must also update after backend confirmation.

---

# 42. Forex Robot Stop/Update Animation

When the user stops the robot:

* Blur/fade the trading-history and profit/loss section.
* Prevent the user from reading stale information.
* Show a central loading animation.

Display:

::در حال اپدیت سود آوری::

over the blurred information area.

The animation remains visible until the admin/backend updates the data.

After backend confirmation:

* Remove the blur.
* Remove the loading animation.
* Show updated trading history.
* Show updated profit/loss.
* Update the user's USDT balance.

---

# 43. Exchange → Assets → Withdraw

In the exchange header:

::دارایی ها::

opens the assets page.

When the user clicks:

::برداشت::

open the crypto withdrawal page.

Add:

::تومان::

as a supported withdrawal asset.

Use the Iranian flag as the visual logo/icon for:

::تومان::

---

# 44. Toman Withdrawal Page

When the user selects:

::تومان::

from the withdrawal page, navigate to a dedicated Toman withdrawal screen.

This page must be visually different from cryptocurrency withdrawal pages.

First form:

::واریز به::

When clicked, show a beautiful card-selection popup.

The popup must show the user's registered bank cards.

Every card must contain:

* Correct bank logo.
* Correct bank theme.
* 16-digit card number.

This card popup must use exactly the same component used elsewhere in the application.

The card box design should be visually consistent with the popular-currency cards on the exchange home page.

Under the first form display:

::مقدار برداشت مجاز امروز برای شبای این کارت مبلغ ۱۰۰،۰۰۰،۰۰۰ تومان است.::

Next form:

::مقدار برداشت به تومان::

Add a small button on the left side:

::حداکثر قابل برداشت::

When clicked, automatically put the maximum available Toman balance into:

::مقدار برداشت به تومان::

The user can also manually enter an amount.

Below it display:

::کل موجودی شما: ۰ تومان::

The `۰` must be dynamically replaceable by backend data.

Bottom button:

::درخواست برداشت::

When all fields are valid, show a beautiful confirmation modal:

::درخواست برداشت تومان شما ثبت گردید.::

---

# 45. Toman Withdrawal Information

At the bottom of the Toman withdrawal page display:

::مقدار حداکثر برداشت ۲۰،۰۰۰ تومان. درخواست‌های برداشت ثبت‌شده، وارد صف سیکل‌های پایا شده و در اولین سیکل یا در برخی موارد تا ۴۸ ساعت تسویه خواهد شد.::

Then show:

::سیکل‌های پایا (روزهای غیر تعطیل)::

::ثبت پیش از ۱۲ ظهر ----> ساعت ۱۲:۴۵ همان روز::

::ثبت پیش از ۱۸ عصر ----> ساعت ۱۸:۴۵ همان روز::

::ثبت پس از ساعت ۱۸ عصر ----> ساعت ۱۲:۴۵ روز کاری بعد::

Then:

::سیکل‌های پایا (روزهای تعطیل)::

::ساعت ۱۲:۴۵ روز کاری بعد::

Present this information beautifully with proper spacing and hierarchy.

---

# 46. Card Logos in Transaction and Payment Forms

Whenever a card is selected or recognized, show:

* Card logo.
* Bank-specific theme.
* 16-digit card number.

This applies to:

::موجودی کارت::
::انتقال وجه::
all payment pages
::پروفایل::
::کارتهای بانکی::
transaction history
withdrawal screens
exchange screens.

---

# 47. Operator Logos in Transactions

For transactions involving:

::ایرانسل::
::همراه اول::
::رایتل::

show the correct uploaded operator logo.

Never use generic green icons if a specific operator logo is available.

---

# 48. Receipt and Navigation Consistency

Every payment flow must end with:

* Successful transaction state.
* Receipt popup.
* Correct transaction record.
* Correct bank/operator/bill logo.

When the receipt popup is closed:

Always return the user to the main home screen.

---

# 49. General Input Quality

Every numeric input must:

* Respect the required digit count.
* Reject excess digits.
* Support paste.
* Support deletion.
* Keep cursor inside the field.
* Never display text outside the field.
* Work correctly with mobile keyboards.
* Work correctly with RTL interfaces.
* Preserve correct LTR behavior for card numbers and numeric values where required.

---

# 50. Final Quality Requirements

Before considering the implementation complete, test every flow on:

* Desktop/web.
* Mobile browser.
* Android APK.

Test:

* Card selection.
* Card detection.
* Bank logo detection.
* Card popup.
* Add-card flow.
* Shaparak redirect.
* Contact selection.
* Iranian phone-number normalization.
* OTP.
* CVV2.
* Month/year.
* Automatic focus.
* Payment buttons.
* Payment scrolling.
* Transaction receipts.
* Transaction logos.
* Insurance pages.
* Vehicle plates.
* ثنا registration.
* Charity payment.
* Bill payment.
* Internet package payment.
* Direct charge.
* Forex robot.
* Forex robot cooldown.
* Forex robot backend status.
* Toman withdrawal.
* Authentication.
* 4-digit PIN.
* Video recording.
* Video upload.

No page should become black, blank, clipped, horizontally broken, vertically overflowing, or require unnecessary scrolling.

The visual language must be consistent across the entire application while preserving the unique visual identity of each bank card and operator.

The most important principle is:

**Use the uploaded real bank/operator logos and the uploaded BIN data consistently throughout the entire application, while keeping every payment component visually identical and reliable.**

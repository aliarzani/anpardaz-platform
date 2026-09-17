## Additional Figma / App Implementation Instructions

I am now providing **10 additional bank logos** from the remaining bank logos. Please add these 10 logos to the application and use them consistently anywhere bank cards or bank selection components are displayed.

### 1. Remaining Bank Logos

The 10 bank logos that I am providing in this message are part of the previously supplied bank-logo set. Do not replace, recolor, distort, or redesign these logos.

Use each logo according to the actual bank associated with the card.

Wherever a bank card is displayed in the application:

* Show the correct bank logo.
* Use the actual visual identity and colors of that bank.
* Do not display all cards using the application's green theme.
* Preserve the existing card structure and make sure the bank logo is clearly visible.
* Use the same bank-logo mapping everywhere in the application for consistency.

---

## 2. Hide Month and Year Values in All Payment Pages

In **all payment pages**, the fields:

::ماه::

and

::سال::

must behave securely.

Any digits entered manually by the user or automatically populated by the application must immediately be hidden/masked.

The behavior must be exactly similar to the existing:

::cvv2::

field.

The user must still be able to enter, delete, replace, and edit the values, but the actual digits must never be visually readable.

This applies to **every payment page**, including but not limited to:

* ::موجودی کارت::
* ::انتقال وجه::
* ::شارژ مستقیم::
* ::بسته اینترنت::
* ::نیکوکاری::
* ::قبض::
* ::خلافی خودرو::
* ::قبض قضائیه::
* ::قبض ثبت اسناد::
* and all other payment-related pages.

Also make sure that:

* Automatically populated expiration-month values are masked.
* Automatically populated expiration-year values are masked.
* Pasted values are masked.
* Manually typed values are masked.
* Deleting and replacing the values continues to work normally.
* The cursor must remain correctly positioned inside the field.

---

## 3. Fix OTP Field Position and Paste Button Overlap

In all payment pages and also on:

::موجودی کارت::

the digits inside the:

::رمز پویا::

field are currently positioned too far to the left.

They overlap with or sit underneath the **Paste** button, making the OTP digits difficult or impossible to understand while entering the code.

Fix the layout.

Move the OTP input content sufficiently to the right so that:

* The entered digits never overlap the Paste button.
* The first digit is completely visible inside the input area before masking.
* The Paste button has enough spacing from the input content.
* The input behaves similarly to the correctly designed ::cvv2:: field.
* The field remains visually balanced on both mobile and web layouts.
* RTL layout must be handled correctly.

Do not allow the Paste button to cover the OTP input area.

---

# 4. Six-Digit Login Code — Automatic Verification

On the application login screen, after the user enters the **six-digit login/verification code**, if the code is correct, the application must automatically authenticate and enter the application.

The user must **not** have to press:

::تایید و ادامه::

after entering a valid six-digit code.

### Backspace/Delete behavior

There is currently a serious issue where the user cannot properly delete digits from the six-digit code.

Fix this completely.

The user must be able to:

* Press the keyboard backspace/delete button to remove the digit from the current/last populated box.
* Press and hold the backspace/delete button to continuously remove previously entered digits.
* Move naturally backward through the six OTP/code boxes.
* Correct any digit without having to restart the entire code.
* Paste a six-digit code if supported by the current design.
* Prevent more than six digits from being entered.
* Automatically verify the code immediately after all six correct digits have been entered.

The cursor/focus behavior between the six input boxes must feel natural and polished.

---

# 5. Forex Exchange Page — ::ربات فارکس::

On the main exchange page, create a **small, elegant, fixed button** near the top of the page with the name:

::ربات فارکس::

Place it in the best possible location without interfering with the existing exchange UI.

The button should have a subtle but attractive glow/shimmer around it so that users notice it, but it should not look excessive or distracting.

---

# 6. Forex Bot Warning Popup

When the user clicks:

::ربات فارکس::

before opening the Forex Bot page, show a beautiful, professional warning/confirmation popup.

The popup must clearly explain that Forex trading involves significant risk.

Include warnings such as:

* Never invest your entire capital in the Forex market.
* Forex trading can result in partial or complete loss of the allocated capital.
* Only allocate an amount that you are prepared to risk.
* Past performance does not guarantee future results.
* The trading bot does not guarantee profit.
* Market conditions can change rapidly.
* The user is responsible for accepting the risks associated with using the trading bot.

The user must explicitly accept responsibility before entering the bot page.

The confirmation button should be:

::تایید::

Only after the user accepts and clicks:

::تایید::

should the application navigate to the Forex Bot page.

---

# 7. Forex Bot Page

Create a dedicated Forex Bot page with a polished and professional financial-dashboard design.

At the top of the page, display the user's **total USDT balance** from:

::دارایی ها::

This value must also remain synchronized with the actual user's USDT balance.

Directly underneath, display:

::موجودی فعال در ربات ۰ دلار تتر::

Under this, create an input field with the label:

::مقدار دلار تتر جهت معامله در بازار فارکس را وارد کنید::

The user enters the amount of USDT they want to allocate to the Forex bot.

### Allocation Rule

The user may only allocate an amount that is **at least 3 USDT less than the total available USDT balance**.

For example:

If the user's total balance is:

100 USDT

the maximum amount that can be allocated to the bot is:

97 USDT.

If the entered amount satisfies this rule:

* Allow the user to enter the amount.
* Update:

::موجودی فعال در ربات ۰ دلار تتر::

based on the entered amount.

The amount must also be validated against the user's actual available balance on the backend.

Do not allow the user to allocate funds that are already locked/actively assigned to another bot position or otherwise unavailable.

---

# 8. Activate Forex Bot

Under the USDT allocation form, create a red button labeled:

::ربات آن پرداز را فعال می کنم::

When the user clicks this button, display a beautiful animated popup.

The animation should visually resemble **green and red trading candlesticks moving dynamically**, creating the feeling of an active trading system.

Under the animation display:

::بعد از تایید توسط آن پرداز، ربات شما با مقدار x دلار تتر( مقدار x همان عددی است که در فرم :مقدار دلار تتر جهت معامله در بازار فارکس را وارد کنید: توسط کاربر وارد شده است ) شروع به معامله در بازار فارکس می کند::

Replace **x** dynamically with the exact amount entered by the user.

Under this message, display in an attractive yellow color:

::در حال تایید اولیه::

The popup must remain active while the bot is awaiting administrative/backend approval.

Also display:

::سود و زیان ربات هر ۲۴ ساعت یکبار و یا هر ۴۸ ساعت یکبار آپدیت می شود::

This information should be clearly visible without making the popup visually crowded.

---

# 9. Backend/Admin Approval State

The Forex Bot activation status must be controlled by the backend/admin system.

Initially show:

::در حال تایید اولیه جهت اتصال ربات::

Once the administrator approves the user through the admin panel/database/backend, automatically change the status to:

::ربات متصل و فعال و در حال ترید است::

Display this active status in an attractive green color.

The UI must update based on the actual backend status rather than relying only on a local frontend state.

---

# 10. Deactivate Forex Bot

At the bottom portion of the animated Forex Bot popup, add a button:

::ربات آن پرداز را غیر فعال می کنم::

When the user clicks it, first show a confirmation dialog asking:

::آیا از متوقف کردن ربات فارکس آن پرداز اطمینان دارید؟ (در هر ۲۴ ساعت فقط یکبار اجازه فعال و غیر فعال کردن ربات را دارید)؟::

The confirmation dialog should have an appropriate confirmation button labeled:

::متوقف کردن::

If the user confirms:

* Close the animated green/red candlestick popup.
* Stop the bot activation state.
* Display:

::تا ۲۴ ساعت دیگر شما نمی توانید از ربات معامله گر فارکس آن پرداز استفاده کنید::

* Disable the:

::ربات آن پرداز را فعال می کنم::

button for the next 24 hours.

* Make the disabled button visibly lighter/dimmed.
* Clearly communicate that the user cannot activate/deactivate the bot again until the 24-hour restriction expires.

The 24-hour restriction must be enforced by the backend/server as well as visually represented in the frontend.

Do not rely solely on frontend state for this restriction.

---

# 11. Forex Bot Transaction History and Statistics

The Forex Bot page must contain a beautiful information/dashboard section showing the user's bot activity and trading history.

Display information such as:

* Number of times the bot has been activated.
* Number of times the bot has been deactivated.
* Amount of capital allocated to each trading session.
* Individual trade amounts.
* Profit/loss for each trade.
* Total accumulated profit.
* Total accumulated loss.
* Net profit/loss.
* Activation dates.
* Deactivation dates.
* Trading session dates.
* Current bot status.
* Amount currently allocated to the bot.
* Amount returned after the trading session.

Use elegant cards/boxes for these statistics so the information is easy to understand.

Also create a beautiful **profitability chart** showing the bot's performance over time.

The chart should be clean, modern, and suitable for a financial application.

---

# 12. USDT Balance Example and Accounting Logic

The application's balance logic must work correctly.

Example:

The user has:

::۱۰۰ دلار تتر::

in:

::دارایی ها::

The same 100 USDT must appear at the top of the Forex Bot page.

The user allocates:

::۵۰ دلار تتر::

to the Forex Bot.

While the bot is active:

* The allocated 50 USDT must no longer be available for other uses in:

::دارایی ها::

* It must be clearly represented as allocated/locked capital.
* The user's available balance must be reduced accordingly.

Suppose the bot generates:

::۲۰ دلار تتر::

profit.

After the trading session is completed, the returned amount is:

::۷۰ دلار تتر::

The final balance should therefore become:

::۱۲۰ دلار تتر::

in:

::دارایی ها::

and the total balance displayed at the top of:

::ربات فارکس::

must also update to:

::۱۲۰ دلار تتر::

The balance calculation must be performed using reliable backend data and must not depend solely on frontend calculations.

---

# 13. Real-Time/Synchronized Balance Display

The total USDT balance shown at the top of:

::ربات فارکس::

must always remain synchronized with:

::دارایی ها::

Whenever the user's available balance changes, update both areas consistently.

When capital is actively allocated to the bot, clearly distinguish:

* Total balance
* Available balance
* Amount allocated to the bot
* Profit/loss
* Returned funds

Do not allow allocated funds to accidentally appear as freely spendable funds elsewhere in the application.

---

# 14. Bot Stop / Profitability Update Animation

When the user stops the Forex Bot, temporarily blur/mask the section containing the bot's:

* Information
* Trading history
* Profit/loss
* Statistics
* Profitability information

Place a beautiful loading/waiting animation in the center of this area.

Display:

::در حال اپدیت سود آوری::

The user should not be able to clearly read the underlying trading information while the update is pending.

The waiting animation should remain visible until the backend/admin system updates the information.

After the administrator/server successfully updates the trading information:

* Remove the blur.
* Fade out the waiting animation.
* Reveal the updated trading history.
* Reveal the updated profit/loss.
* Reveal the updated statistics.
* Update the profitability chart.
* Update the user's USDT balance where applicable.

The transition should be smooth and visually polished.

---

# 15. Important UX and Consistency Requirements

Across the entire Forex Bot experience:

* Maintain the application's existing visual language.
* Use the application's existing typography, spacing, border radius, and component style where appropriate.
* Make the Forex Bot feel like a premium part of the application rather than a separate unrelated page.
* All animations should be smooth and professional.
* Do not use excessive flashing or distracting effects.
* All states must have clear visual feedback.
* Loading, pending, active, stopped, disabled, and error states must be visually distinguishable.
* All financial values must use consistent formatting.
* Prevent invalid or excessive numeric input.
* Ensure the design works correctly on both mobile APK and web versions.
* Make sure RTL/Persian text alignment is correct throughout the entire Forex Bot experience.
* Ensure all backend-controlled states remain synchronized with the frontend.
* Do not rely on frontend-only restrictions for financial balances, activation limits, or the 24-hour activation/deactivation rule.

These instructions are additional to all previous application-design and payment-flow requirements. Do not remove or overwrite the previously implemented requirements.

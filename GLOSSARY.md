# The Tiffin Club Admin

The operator console for the same-day tiffin storefront: staff manage today's menu and its orders here.

## Language

**Menu**:
Today's Menu — the single day's offering, one Main plus any Extras. Exactly one menu per calendar day, published at 09:00 Pacific/Auckland.
_Avoid_: Catalogue, dishes, menu (unqualified)

**Main**:
The primary dish of Today's Menu, the default item pre-seeded into a cart.
_Avoid_: Special, combo, thali

**Extra**:
An optional item on Today's Menu added alongside the Main.
_Avoid_: Add-on, side

**Ordering Window**:
The period on a given day — opening 09:00 (or publish time if later) and closing at the Menu Cutoff — during which new orders may be placed, edited, or cancelled. Server-computed.
_Avoid_: Opening hours, business hours

**Menu Cutoff**:
The time after which an order can no longer be placed, edited, or cancelled. Set per menu; falls back to the store's default when the menu has none.
_Avoid_: Deadline, closing time, cutoff time

**Order**:
A customer's request for items from a single day's menu, placed within the Ordering Window and paying in person.
_Avoid_: Purchase, booking, cart

**Fulfilment**:
How an Order is handed to the Customer — pickup or delivery. A fixed attribute set at checkout, not a workflow.
_Avoid_: Fulfillment (US spelling), shipping

**Order Status**:
The one-way workflow state of an Order, branched by Fulfilment: pickup goes confirmed → ready for pickup → completed; delivery goes confirmed → out for delivery → completed. Cancelled is reachable from any non-terminal state. Every change is audited (ADR 0003).
_Avoid_: Fulfilment (that's pickup vs delivery), order state

**Payment**:
An immutable record of cash collected against an Order, in whole cents. Never edited, refunded, or deleted (ADR 0001).
_Avoid_: Transaction, refund

**Outstanding Balance**:
The part of an Order's total not yet covered by Payments: total minus the paid sum. The most a single Payment may record; recording more is rejected.
_Avoid_: Due, amount owed, remaining balance

**Customer**:
The person placing orders, identified by email or phone. Found or created at checkout from the submitted contact details.
_Avoid_: User, account holder, Guest (Guest means a customer without an account)

**List Page**:
A page that shows a scrolling collection of records — Orders, Customers, or Payments — with filtering, sorting, and pagination. One page of records at a time, fetched from the API on demand.
_Avoid_: Table view, grid, index (unqualified)

**Applied Filters**:
The filter values currently governing what a List Page fetches. Changes apply immediately — live for text, instantly for selects — and are reflected in the page URL so a filtered view can be shared or revisited.
_Avoid_: Draft filters, pending filters, filter buffer

**Query Envelope**:
The standard wrapper around every list response from the admin API: the records themselves plus pagination metadata. Consumed by List Pages to drive pagination and result counts.
_Avoid_: Response body, payload (unqualified)

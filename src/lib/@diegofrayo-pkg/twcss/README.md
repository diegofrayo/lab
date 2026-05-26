# @diegofrayo/lib/twcss

## Description

Library with `styled-components` flavored syntax for creating components easily using `tailwind` classes or your own classes

## Examples

- Basic
  ```
  // definition
  const LineContent = twcss.span("table-cell your-own-class");
  const LineContent = twcss.span`table-cell your-own-class`;
  const LineContent = twcss.span``;

  // usage
  <LineContent id="id" className="add-more-classes">hello</LineContent>
  ```

- With a map of styles variants
  ```
  // definition
  const MyElement = twcss.p({
    $TWCSS_BASE_STYLES: "text-lg",
    UNSTYLED: "",
    STYLED:
      "bg-zinc-400",
    SECONDARY: (props) => `text-white ${props.active ? "font-bold" : ""}`,
  });

  // usage
  <MyElement>
    {children}
  </MyElement>
  <MyElemen TWCSSVariant="SECONDARY" active>
    {children}
  </MyElemen>
  ```

- Passing a custom component as main tag and setting a staticProps object
  ```
  // definition
  const YourOwnButton = (props) => <button {...props}>
  const MyTWCSSButton = twcss(YourOwnButton)(
    "font-bold",
    {
      role: "submit",
    },
  );

  // usage
  <MyTWCSSButton className="text-zinc-500">

  // output
  <button role="submit" class="font-bold text-zinc-500" />
  ```

## Inspiration

- **[tw-classed.vercel.app | [tw-classed.vercel.app]](https://tw-classed.vercel.app/)**
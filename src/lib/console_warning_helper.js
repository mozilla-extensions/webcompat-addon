const ConsoleWarningEyeCatch = "Oh no!";
const ConsoleWarningDetails = `
This web site has a web compatibility issue.
If you see this message, you are probably a
developer that works on $DOMAIN$
As you can see from our about:compat page,
our browser has to use some work-arounds on this site.
Please fix these issues.`;

function promiseConsoleWarningScript(domain) {
  const details = ConsoleWarningDetails.replace("$DOMAIN$", domain);
  return Promise.resolve({
    code: `if (!window.alreadyWarned) {
             window.alreadyWarned = true;
             console.warn("%c${ConsoleWarningEyeCatch}",
               "font-size:50px; font-weight:bold; color:red; -webkit-text-stroke:1px black",
               ${JSON.stringify(details)});
           }`,
  });
}

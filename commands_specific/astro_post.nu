let $fouc = "<script>
  /*to prevent Firefox FOUC, this must be here*/
  let FF_FOUC_FIX;
</script>"
let $head = "</head>"

let $replacements = ls astro/dist/**/* | where {$in.name =~ "html"} | each {[$in.name (open $in.name | collect | split row $head | $in.0 + "\n" + $fouc + "\n" + $head + "\n" + $in.1)]}

for $replace in $replacements {
  $replace.1 | save $replace.0 -f
}

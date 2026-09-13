; -*- mode: clojure -*-

(is (= (capitalize "hey!") "Hey!"))
(is (= (upcase "hey!") "HEY!"))
(is (= (downcase "HEY") "hey"))
(is (= (words "hey you") ["hey" "you"]))
(is (= (titlecase "this is the beginning") "This Is The Beginning"))

ruleset {
    description 'Grails-CodeNarc Project RuleSet'

    ruleset('rulesets/basic.xml')
    ruleset('rulesets/braces.xml')
    ruleset('rulesets/comments.xml')
    ruleset('rulesets/concurrency.xml')
    ruleset('rulesets/convention.xml')
    ruleset('rulesets/design.xml') {
        exclude 'CloneWithoutCloneable' // enhanced rule
    }
    ruleset('rulesets/dry.xml')
    // 'enhanced' rules (also excluded individually below) compile sources to the
    // semantic-analysis phase, which needs the full application classpath that the
    // CodeNarc task doesn't have - they only produce "unable to resolve class" noise
    ruleset('rulesets/exceptions.xml')
    ruleset('rulesets/formatting.xml')
    ruleset('rulesets/generic.xml')
    ruleset('rulesets/grails.xml') {
        exclude 'GrailsDomainGormMethods' // enhanced rule
    }
    ruleset('rulesets/groovyism.xml')
    ruleset('rulesets/imports.xml')
    ruleset('rulesets/jdbc.xml')
    ruleset('rulesets/junit.xml') {
        exclude 'JUnitAssertEqualsConstantActualValue' // enhanced rule
    }
    ruleset('rulesets/logging.xml')
    ruleset('rulesets/naming.xml')
    ruleset('rulesets/security.xml') {
        exclude 'UnsafeImplementationAsMap' // enhanced rule
    }
    ruleset('rulesets/serialization.xml') {
        exclude 'NonSerializableFieldInSerializableClass' // enhanced rule
    }
    ruleset('rulesets/size.xml')
    ruleset('rulesets/unnecessary.xml')
    ruleset('rulesets/unused.xml')

}